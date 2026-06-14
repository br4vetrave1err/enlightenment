import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["roadmap_learning"]
    async for c in db.courses.find({"nodes.links.0": {"$exists": True}}, {"course_id": 1, "nodes": 1}):
        print("Course:", c["course_id"])
        nodes_with_links = [n for n in c["nodes"] if n.get("links")]
        for n in nodes_with_links[:3]:
            print("  Node:", n.get("node_id"), "Title:", n.get("title"))
            print("  Links:", n.get("links"))
        break
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
