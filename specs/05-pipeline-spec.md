# Content Pipeline Specification — GitHub Webhook → Knowledge Graph

**Trigger:** GitHub webhook on push to `nilbuild/developer-roadmap`  
**Execution:** Deterministic async pipeline (no LLM at query time)  
**LLM calls:** Only during sync (entity extraction, community summaries)  
**LLM provider:** Zen API via Go subscription

---

## Pipeline Overview

```
GitHub Webhook → Fetch → Parse → LLM Extract → Build Graph → Store
     │              │        │         │            │            │
     │              10s      5s      60-120s        5s          5s
     │                                                              │
     └──── Total: ~2-5 minutes (background, non-blocking) ──────────┘
```

---

## Step 1: FETCH

**Trigger:** POST `/api/webhook/github`

**Validation:**
- Verify `X-Hub-Signature-256` HMAC signature
- Verify push is to `master` branch
- Reject if signature invalid → 401

**Logic:**
```python
async def fetch_content(payload: dict) -> FetchResult:
    new_sha = payload["head_commit"]["id"]

    last_sync = db.sync_log.find_one(sort=[("started_at", -1)])
    if last_sync and last_sync["github_sha"] == new_sha:
        return FetchResult(status="no_changes", sha=new_sha)

    repo_path = "/tmp/roadmap-repo"
    if os.path.exists(repo_path):
        run(f"cd {repo_path} && git pull")
    else:
        run(f"git clone --depth 1 https://github.com/nilbuild/developer-roadmap.git {repo_path}")

    return FetchResult(status="success", sha=new_sha, repo_path=repo_path)
```

**Output:** `FetchResult(status, sha, repo_path)`

---

## Step 2: PARSE

**Input:** Cloned repo path  
**Output:** List of parsed courses with nodes, edges, content

**Logic:**
```python
def parse_roadmaps(repo_path: str) -> list[ParsedCourse]:
    courses = []
    roadmaps_dir = os.path.join(repo_path, "src", "data", "roadmaps")

    for json_file in glob(f"{roadmaps_dir}/*.json"):
        with open(json_file) as f:
            roadmap_data = json.load(f)

        course_id = os.path.basename(json_file).replace(".json", "")

        nodes = []
        for node in roadmap_data.get("nodes", []):
            nodes.append({
                "node_id": node["id"],
                "title": node.get("title", ""),
                "position": node.get("position", {"x": 0, "y": 0}),
                "tags": node.get("tags", []),
                "links": node.get("links", []),
            })

        edges = []
        for edge in roadmap_data.get("edges", []):
            edges.append({
                "from": edge["from"],
                "to": edge["to"],
                "type": edge.get("type", "sequential"),
            })

        md_path = os.path.join(roadmaps_dir, f"{course_id}.md")
        if os.path.exists(md_path):
            content = parse_markdown_by_node(md_path, nodes)
            for node in nodes:
                node["content"] = content.get(node["node_id"], "")

        courses.append(ParsedCourse(
            course_id=course_id,
            title=roadmap_data.get("title", course_id),
            description=roadmap_data.get("description", ""),
            icon=roadmap_data.get("icon", "📚"),
            nodes=nodes,
            edges=edges,
        ))

    return courses
```

---

## Step 3: LLM ENTITY EXTRACTION

**Input:** Parsed courses with node content  
**Output:** Extracted concepts, relationships, difficulty per node  
**Model:** Qwen3.5 Plus  
**Cost:** ~$0.0003 per node × ~500 nodes = ~$0.15 per full sync

**Prompt:**
```
Extract structured knowledge from this roadmap learning node.

Title: {title}
Content: {content}
Tags: {tags}

Return ONLY valid JSON:
{{
  "key_concepts": ["concept1", "concept2"],
  "prerequisites": ["topic_a", "topic_b"],
  "related_topics": ["topic_c", "topic_d"],
  "implements": ["technology_x"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "summary": "One-sentence summary"
}}

Rules:
- key_concepts: 2-5 core topics
- prerequisites: Topics needed before this node
- related_topics: Connected topics (same level or adjacent)
- implements: Technologies/tools mentioned
- difficulty: Overall difficulty level
- summary: One sentence, clear and concise
- Use lowercase, hyphenated names (e.g., "rest-api")
```

**Execution:**
```python
async def extract_entities(courses: list[ParsedCourse]) -> list[ParsedCourse]:
    for course in courses:
        for node in course.nodes:
            if not node.get("content"):
                continue

            prompt = EXTRACTION_PROMPT.format(
                title=node["title"],
                content=node["content"][:2000],
                tags=node.get("tags", [])
            )

            response = await zen_api.chat(
                model="qwen3.5-plus",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )

            extracted = json.loads(response)
            node["extracted_concepts"] = extracted["key_concepts"]
            node["prerequisites"] = extracted["prerequisites"]
            node["related_topics"] = extracted["related_topics"]
            node["implements"] = extracted["implements"]
            node["difficulty"] = extracted["difficulty"]
            node["summary"] = extracted["summary"]

            await asyncio.sleep(0.1)  # rate limiting

    return courses
```

---

## Step 4: BUILD GRAPH

**Input:** Parsed courses with extracted entities  
**Output:** `topic_graph` documents ready for MongoDB

**Logic:**
```python
def build_knowledge_graph(courses: list[ParsedCourse]) -> list[TopicGraphDoc]:
    graph = {}

    for course in courses:
        for node in course.nodes:
            for tag in node.get("tags", []):
                if tag not in graph:
                    graph[tag] = TopicGraphDoc(_id=tag, name=tag)
                graph[tag].courses_seen_in.append(course.course_id)
                graph[tag].node_ids.append(node["node_id"])

            for concept in node.get("extracted_concepts", []):
                if concept not in graph:
                    graph[concept] = TopicGraphDoc(_id=concept, name=concept)
                graph[concept].node_ids.append(node["node_id"])

            for prereq in node.get("prerequisites", []):
                add_relationship(graph, node["node_id"], prereq, "prerequisite", 0.8)

            for related in node.get("related_topics", []):
                add_relationship(graph, node["node_id"], related, "related", 0.6)

            for impl in node.get("implements", []):
                add_relationship(graph, node["node_id"], impl, "implemented_by", 0.7)

        for edge in course.edges:
            add_relationship(graph, edge["from"], edge["to"], edge["type"], 0.9)

    for topic in graph.values():
        topic.relationships = deduplicate_relationships(topic.relationships)

    return list(graph.values())
```

---

## Step 5: STORE

**Input:** Parsed courses + topic graph documents  
**Output:** MongoDB updated, sync log created

**Logic:**
```python
async def store_results(
    courses: list[ParsedCourse],
    graph_docs: list[TopicGraphDoc],
    sha: str,
) -> SyncResult:
    nodes_added = 0
    nodes_updated = 0

    for course in courses:
        existing = db.courses.find_one({"course_id": course.course_id})
        if existing:
            nodes_updated += len(course.nodes)
        else:
            nodes_added += len(course.nodes)

        db.courses.update_one(
            {"course_id": course.course_id},
            {"$set": {
                "title": course.title,
                "description": course.description,
                "icon": course.icon,
                "nodes": course.nodes,
                "edges": course.edges,
                "last_synced": datetime.utcnow(),
                "github_sha": sha,
            }},
            upsert=True,
        )

    for doc in graph_docs:
        db.topic_graph.update_one(
            {"_id": doc["_id"]},
            {"$set": {**doc.dict(), "last_updated": datetime.utcnow()}},
            upsert=True,
        )

    db.sync_log.insert_one({
        "triggered_by": "webhook",
        "github_sha": sha,
        "started_at": datetime.utcnow(),
        "completed_at": datetime.utcnow(),
        "status": "completed",
        "courses_updated": [c.course_id for c in courses],
        "nodes_added": nodes_added,
        "nodes_updated": nodes_updated,
    })

    return SyncResult(
        status="completed",
        courses_updated=len(courses),
        nodes_added=nodes_added,
        nodes_updated=nodes_updated,
    )
```

---

## Error Handling

- **Retry:** Failed steps retry up to 3 times with exponential backoff
- **Partial sync OK:** If LLM extraction fails for a node, content is still stored
- **Idempotent:** Running sync twice with same SHA = no-op
- **Webhook validation:** Reject invalid signatures → 401
- **Timeout:** 10-minute pipeline timeout

---

## Fallback Sync

```python
@cron.schedule("0 */6 * * *")
async def fallback_sync():
    """Catch missed webhooks by checking for new commits."""
    latest_sha = get_latest_github_sha()
    last_sync = db.sync_log.find_one(sort=[("started_at", -1)])

    if not last_sync or last_sync["github_sha"] != latest_sha:
        await run_pipeline(triggered_by="cron")
```

---

## Pipeline Orchestration

```python
async def run_pipeline(triggered_by: str = "webhook", payload: dict = None):
    sync_id = str(uuid4())

    try:
        fetch_result = await fetch_content(payload)
        if fetch_result.status == "no_changes":
            return {"status": "no_changes"}

        courses = parse_roadmaps(fetch_result.repo_path)
        courses = await extract_entities(courses)
        graph_docs = build_knowledge_graph(courses)
        result = await store_results(courses, graph_docs, fetch_result.sha)

        return result

    except Exception as e:
        db.sync_log.insert_one({
            "triggered_by": triggered_by,
            "status": "failed",
            "error": str(e),
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
        })
        raise
```
