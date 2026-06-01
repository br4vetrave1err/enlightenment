# Roadmap Learning

A mobile-first learning platform that transforms roadmap.sh content into interactive constellation maps with an AI chat tutor.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React Native   │────▶│   FastAPI (Go)   │────▶│  MongoDB    │
│  (Expo)         │◀────│   SSE Streaming  │◀────│  + Text     │
└─────────────────┘     └────────┬─────────┘     │  Search     │
                                 │               └─────────────┘
                          ┌──────▼──────┐
                          │  LangGraph  │
                          │  Agent      │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │  Zen API    │
                          │  (LLM)      │
                          └─────────────┘
```

## Project Structure

```
enlightenment/
├── specs/                    # SDD specifications
│   ├── 01-api-spec.md        # API endpoints and schemas
│   ├── 02-data-model.md      # MongoDB collections and indexes
│   ├── 03-chat-agent.md      # LangGraph agent design
│   ├── 04-mobile-contract.md # React Native API contracts
│   └── 05-pipeline-spec.md   # Content ingestion pipeline
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, auth, security
│   │   ├── models/           # Pydantic models
│   │   └── services/         # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/                   # React Native (Expo) - Phase 2
├── shared/
│   └── api-contract.ts       # Shared TypeScript types
├── docker/
│   └── docker-compose.yml
└── .env.example
```

## Quick Start

### 1. Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start Services

```bash
cd docker
docker compose up -d
```

### 3. Verify

```bash
curl http://localhost:8000/api/health
# {"status": "ok"}
```

## Content Sync

Content is synced from `kamranahmedse/developer-roadmap` via:
- **GitHub webhook** on push to `master` (real-time)
- **Fallback cron** every 6 hours (catches missed webhooks)

Pipeline: Fetch → Parse → LLM Extract → Build Graph → Store

## Phases

- **Phase 1:** Core platform + Graph/Text retrieval (current)
- **Phase 2:** Ollama embeddings + vector search
- **Phase 3:** Community features + spaced repetition

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo) |
| Backend | FastAPI (async) |
| Database | MongoDB 7.0 |
| Agent | LangGraph |
| LLM | Zen API (Qwen3.6 Plus) |
| Auth | JWT + Google OAuth |
| Deployment | Docker Compose + Tailscale |
