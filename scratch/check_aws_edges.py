import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["roadmap_learning"]
    course = await db.courses.find_one({"course_id": "aws"})
    if course:
        print("Edges for Introduction (Py9nst2FDJ1_hoXeX_qSF):")
        for e in course.get("edges", []):
            if e["to"] == "Py9nst2FDJ1_hoXeX_qSF" or e["from"] == "Py9nst2FDJ1_hoXeX_qSF":
                print(f"  {e['from']} -> {e['to']}")
                
        print("\nEdges for What is Cloud Computing? (74JxgfJ_1qmVNZ_QRp9Ne):")
        for e in course.get("edges", []):
            if e["to"] == "74JxgfJ_1qmVNZ_QRp9Ne" or e["from"] == "74JxgfJ_1qmVNZ_QRp9Ne":
                print(f"  {e['from']} -> {e['to']}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
