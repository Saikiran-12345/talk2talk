import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import engine, Base
from app.api.routes import router as api_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("talk2talk")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Talk2Talk — Local Voice-to-Voice Translator API"
)

# CORS setup for localhost & production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Frontend static assets if built (dist directory)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa_or_root(full_path: str):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        return {"message": "Talk2Talk API", "health_check": "/api/health"}

    if os.path.exists(frontend_dist):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)

    return {
        "message": "Welcome to Talk2Talk API",
        "health_check": "/api/health",
        "docs": "/docs"
    }
