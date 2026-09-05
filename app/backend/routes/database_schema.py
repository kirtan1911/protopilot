from fastapi import APIRouter, HTTPException, Depends
from database import db
from utils import now_iso
from deps import get_current_user
from ai_client import gemini_json
from prompts.database_generation import DB_SYSTEM_PROMPT, DB_USER_PROMPT_TEMPLATE
import json

router = APIRouter(prefix="/projects", tags=["Database Schema"])

@router.post("/{project_id}/schema")
async def generate_schema(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project or not project.get("requirements"):
        raise HTTPException(status_code=400, detail="Requirements missing")
        
    prompt = DB_USER_PROMPT_TEMPLATE.format(requirements=json.dumps(project["requirements"]))
    schema = await gemini_json(DB_SYSTEM_PROMPT, prompt)
    
    await db.projects.update_one({"id": project_id}, {"$set": {"schema_spec": schema, "updated_at": now_iso()}})
    return schema
