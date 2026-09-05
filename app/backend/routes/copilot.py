from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import db
from deps import get_current_user
from ai_client import gemini_text

router = APIRouter(prefix="/projects", tags=["Copilot"])

class CopilotRequest(BaseModel):
    message: str

@router.post("/{project_id}/copilot")
async def copilot_chat(project_id: str, data: CopilotRequest, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    response = await gemini_text("You are an AI assistant helping with a software project.", data.message)
    return {"response": response}
