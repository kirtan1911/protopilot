from fastapi import APIRouter, HTTPException, Depends
from database import db
from schemas import ProjectCreate, ProjectUpdate
from utils import now_iso
from deps import get_current_user
import uuid

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("")
async def get_projects(user=Depends(get_current_user)):
    cursor = db.projects.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1)
    return await cursor.to_list(length=100)

@router.post("")
async def create_project(data: ProjectCreate, user=Depends(get_current_user)):
    project_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.name,
        "description": data.description,
        "created_at": now_iso(),
        "updated_at": now_iso()
    }
    await db.projects.insert_one(project_doc)
    project_doc.pop("_id", None)
    return project_doc

@router.get("/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}
