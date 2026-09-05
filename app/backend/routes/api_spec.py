from fastapi import APIRouter, HTTPException, Depends
from database import db
from utils import now_iso
from deps import get_current_user
from ai_client import gemini_json
from prompts.api_generation import API_SYSTEM_PROMPT, API_USER_PROMPT_TEMPLATE
import json

router = APIRouter(prefix="/projects", tags=["API Spec"])

@router.post("/{project_id}/api-spec")
async def generate_api_spec(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project or not project.get("requirements"):
        raise HTTPException(status_code=400, detail="Requirements missing")
        
    prompt = API_USER_PROMPT_TEMPLATE.format(requirements=json.dumps(project["requirements"]))
    api_spec = await gemini_json(API_SYSTEM_PROMPT, prompt)
    
    await db.projects.update_one({"id": project_id}, {"$set": {"api_spec": api_spec, "updated_at": now_iso()}})
    return api_spec
