"""
ProtoPilot — FastAPI backend (Refactored)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from database import mongo_client

from routes.auth import router as auth_router
from routes.projects import router as projects_router
from routes.transcription import router as transcription_router
from routes.requirements import router as requirements_router
from routes.database_schema import router as database_schema_router
from routes.api_spec import router as api_spec_router
from routes.wireframes import router as wireframes_router
from routes.exports import router as exports_router
from routes.copilot import router as copilot_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

from fastapi.responses import JSONResponse
from fastapi import Request

app = FastAPI(
    title="ProtoPilot API",
    description="AI-powered meeting-to-prototype generation API",
    version="2.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
env_origins = os.environ.get("CORS_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.exception(f"Unhandled server exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"},
    )


app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(transcription_router, prefix="/api")
app.include_router(requirements_router, prefix="/api")
app.include_router(database_schema_router, prefix="/api")
app.include_router(api_spec_router, prefix="/api")
app.include_router(wireframes_router, prefix="/api")
app.include_router(exports_router, prefix="/api")
app.include_router(copilot_router, prefix="/api")

@app.get("/api/")
async def root():
    return {"message": "ProtoPilot API", "version": "2.0.0", "status": "ok"}

@app.on_event("shutdown")
async def shutdown_db_client():
    mongo_client.close()