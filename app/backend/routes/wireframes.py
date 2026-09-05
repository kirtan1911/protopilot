from fastapi import APIRouter, HTTPException, Depends
import json
import logging
from database import db
from utils import now_iso
from deps import get_current_user
from ai_client import gemini_json, gemini_text
from prompts.wireframe_generation import (
    WIREFRAME_MANIFEST_SYSTEM_PROMPT, 
    WIREFRAME_MANIFEST_USER_PROMPT_TEMPLATE,
    WIREFRAME_PAGE_SYSTEM_PROMPT,
    WIREFRAME_PAGE_USER_PROMPT_TEMPLATE
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["Wireframes"])

@router.post("/{project_id}/wireframe-manifest")
async def generate_wireframe_manifest(project_id: str, user=Depends(get_current_user)):
    p = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not p or not p.get("requirements"):
        raise HTTPException(status_code=400, detail="Extract requirements first")

    prompt = WIREFRAME_MANIFEST_USER_PROMPT_TEMPLATE.format(
        style="Modern Glassmorphism SaaS",
        requirements=json.dumps(p['requirements'])
    )

    try:
        data = await gemini_json(WIREFRAME_MANIFEST_SYSTEM_PROMPT, prompt)
    except Exception as e:
        logger.exception(f"Wireframe manifest generation failed: {e}")
        raise HTTPException(status_code=500, detail="Manifest generation failed.")

    await db.projects.update_one(
        {"id": project_id}, 
        {"$set": {"wireframe_manifest": data, "updated_at": now_iso()}}
    )
    return data

@router.post("/{project_id}/wireframe-page")
async def generate_wireframe_page(project_id: str, page_id: str, user=Depends(get_current_user)):
    p = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    manifest = p.get("wireframe_manifest")
    if not manifest:
        raise HTTPException(status_code=400, detail="Generate wireframe manifest first")

    page_info = next((page for page in manifest.get("pages", []) if page["id"] == page_id), None)
    if not page_info:
        raise HTTPException(status_code=404, detail="Page not found in manifest")

    prompt = WIREFRAME_PAGE_USER_PROMPT_TEMPLATE.format(
        page_name=page_info.get("name"),
        purpose=page_info.get("purpose"),
        components=page_info.get("components_needed"),
        design_system=json.dumps(manifest.get("design_system")),
        module_context=page_info.get("module")
    )

    try:
        html = await gemini_text(WIREFRAME_PAGE_SYSTEM_PROMPT, prompt)
    except Exception as e:
        logger.exception(f"Wireframe page generation failed: {e}")
        raise HTTPException(status_code=500, detail="Page generation failed.")

    # Save to pages array/dict
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {f"wireframe_pages.{page_id}": html, "updated_at": now_iso()}}
    )
    return {"html": html}