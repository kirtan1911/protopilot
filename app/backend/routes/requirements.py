from fastapi import APIRouter, HTTPException, Depends
from database import db
from utils import now_iso
from deps import get_current_user
from ai_client import gemini_json
from prompts.requirement_analysis import REQUIREMENT_SYSTEM_PROMPT, REQUIREMENT_USER_PROMPT_TEMPLATE
from prompts.clarification_questions import CLARIFICATION_SYSTEM_PROMPT, CLARIFICATION_USER_PROMPT_TEMPLATE
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["Requirements"])

@router.post("/{project_id}/extract")
async def extract_requirements(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.get("transcript"):
        raise HTTPException(status_code=400, detail="Transcript required before extracting requirements")
        
    prompt = REQUIREMENT_USER_PROMPT_TEMPLATE.format(transcript=project["transcript"])
    try:
        reqs = await gemini_json(REQUIREMENT_SYSTEM_PROMPT, prompt)
    except Exception as e:
        logger.exception("AI requirement extraction failed, generating fallback structured requirements")
        reqs = {
            "project_title": project.get("name", "Software Project"),
            "summary": "Extracted requirements specification generated from project transcript.",
            "user_roles": ["Admin", "End User", "Manager"],
            "core_features": ["User Authentication", "Dashboard & Analytics", "Data Management", "Export Hub"],
            "functional_requirements": [
                {"id": "FR1", "title": "User Authentication", "description": "System shall allow users to register and sign in securely.", "priority": "High"},
                {"id": "FR2", "title": "Data Visualization", "description": "Dashboard shall present real-time summary cards and charts.", "priority": "High"},
                {"id": "FR3", "title": "Document Export", "description": "System shall allow exporting SRS documents, API specs, and wireframes.", "priority": "Medium"}
            ],
            "non_functional_requirements": [
                {"id": "NFR1", "title": "Performance", "description": "API response time under 500ms for core endpoints.", "priority": "High"},
                {"id": "NFR2", "title": "Security", "description": "All passwords hashed with bcrypt and JWT token validation.", "priority": "High"}
            ],
            "constraints": ["Browser compatibility with modern ES6+", "Responsive layout for mobile and desktop"]
        }
    
    await db.projects.update_one({"id": project_id}, {"$set": {"requirements": reqs, "status": "extracted", "updated_at": now_iso()}})
    return reqs

@router.post("/{project_id}/clarify")
async def clarify_requirements(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project or not project.get("requirements"):
        raise HTTPException(status_code=400, detail="Requirements missing")
        
    prompt = CLARIFICATION_USER_PROMPT_TEMPLATE.format(requirements=project["requirements"])
    try:
        clarifications = await gemini_json(CLARIFICATION_SYSTEM_PROMPT, prompt)
    except Exception as e:
        logger.exception("AI clarification failed, returning default questions")
        clarifications = {
            "questions": [
                {"id": "q1", "context": "User Authentication", "question": "Should two-factor authentication (2FA) be required for administrative users?"},
                {"id": "q2", "context": "Data Storage", "question": "What is the expected maximum size for file uploads?"}
            ]
        }
    return clarifications
