import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.routers import documents, faces, health, recognition, speakers
from app.services.face_engine import get_face_engine
from app.services.faiss_index import get_faiss_manager, get_speaker_faiss_manager
from app.services.speaker_engine import get_speaker_engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.environment)

    logger.info("Loading InsightFace model and FAISS index...")
    get_face_engine()
    get_faiss_manager()
    logger.info("Loading speaker embedding model and speaker FAISS index...")
    get_speaker_engine()
    get_speaker_faiss_manager()
    logger.info("SMMS AI service ready")

    yield

    logger.info("Shutting down SMMS AI service")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="SMMS AI Service",
        description="Face recognition, video/document processing and OCR microservice for the Student Media Management System",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.detail})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception while processing %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal AI service error"})

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(faces.router, prefix="/api/v1")
    app.include_router(speakers.router, prefix="/api/v1")
    app.include_router(recognition.router, prefix="/api/v1")
    app.include_router(documents.router, prefix="/api/v1")

    return app


app = create_app()