import asyncio

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import verify_internal_api_key
from app.models.schemas import ExtractedStudentFields, ProcessDocumentRequest, ProcessDocumentResponse
from app.routers.recognition import _detect_and_match
from app.services.document_utils import extract_docx_text_and_image, render_pdf_first_page
from app.services.image_utils import decode_image_bytes, encode_image_to_jpeg_base64
from app.services.ocr_engine import run_ocr
from app.services.ocr_parser import parse_student_fields
from app.utils.http_client import download_to_bytes

router = APIRouter(prefix="/documents", tags=["documents"], dependencies=[Depends(verify_internal_api_key)])

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@router.post("/process", response_model=ProcessDocumentResponse)
async def process_document(request: ProcessDocumentRequest):
    document_bytes = await download_to_bytes(request.document_url)

    raw_text = ""
    confidence = 0.0
    image_bgr = None

    if request.mime_type == "application/pdf":
        image_bgr = await asyncio.to_thread(render_pdf_first_page, document_bytes)
        raw_text, confidence = await asyncio.to_thread(run_ocr, image_bgr)

    elif request.mime_type == DOCX_MIME:
        raw_text, image_bgr = await asyncio.to_thread(extract_docx_text_and_image, document_bytes)
        if raw_text.strip():
            confidence = 0.99
        elif image_bgr is not None:
            raw_text, confidence = await asyncio.to_thread(run_ocr, image_bgr)

    elif request.mime_type.startswith("image/"):
        image_bgr = await asyncio.to_thread(decode_image_bytes, document_bytes)
        raw_text, confidence = await asyncio.to_thread(run_ocr, image_bgr)

    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported document mime type: {request.mime_type}",
        )

    extracted = parse_student_fields(raw_text)

    faces = []
    page_image_base64 = None
    page_image_mime = None
    if image_bgr is not None:
        faces = await asyncio.to_thread(_detect_and_match, image_bgr, request.top_k, request.threshold)
        page_image_base64 = await asyncio.to_thread(encode_image_to_jpeg_base64, image_bgr)
        page_image_mime = "image/jpeg"

    return ProcessDocumentResponse(
        raw_text=raw_text,
        extracted=ExtractedStudentFields(**extracted),
        confidence=confidence,
        page_image_base64=page_image_base64,
        page_image_mime=page_image_mime,
        faces=faces,
    )
