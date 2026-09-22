from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.session import get_db
from app.schemas.translation import (
    TranslationRequest,
    TranslationResponse,
    SpeechSynthesisRequest,
    HistoryResponse,
    HistoryItemSchema,
    LanguageOption,
)
from app.services.translation_service import TranslationService
from app.services.speech_service import SpeechService
from app.services.history_service import HistoryService

router = APIRouter()

from sqlalchemy import text

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend status and database connectivity."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "ok",
        "service": "Talk2Talk Local Voice Translator",
        "database": db_status,
        "version": "1.0.0"
    }

@router.get("/languages", response_model=List[LanguageOption])
def get_supported_languages():
    """Returns list of languages supported by Talk2Talk."""
    return TranslationService.get_supported_languages()

@router.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest, db: Session = Depends(get_db)):
    """Translate text between supported languages and optionally save to SQLite history."""
    success, result_text, duration_ms, error_code = TranslationService.translate(
        text=req.text,
        source_lang=req.source_language,
        target_lang=req.target_language
    )

    if not success:
        return TranslationResponse(
            success=False,
            source_language=req.source_language,
            target_language=req.target_language,
            original_text=req.text,
            translated_text="",
            execution_time_ms=duration_ms,
            error={
                "code": error_code or "TRANSLATION_FAILED",
                "message": result_text
            }
        )

    history_id = None
    if req.save_to_history:
        try:
            record = HistoryService.create_history_record(
                db=db,
                source_lang=req.source_language,
                target_lang=req.target_language,
                original_text=req.text,
                translated_text=result_text
            )
            history_id = record.id
        except Exception as e:
            # Non-fatal DB error - return translation result anyway
            pass

    return TranslationResponse(
        success=True,
        source_language=req.source_language,
        target_language=req.target_language,
        original_text=req.text,
        translated_text=result_text,
        history_id=history_id,
        execution_time_ms=duration_ms
    )

@router.post("/speech/synthesize")
def synthesize_speech(req: SpeechSynthesisRequest):
    """Generate audio MP3 stream for text-to-speech."""
    try:
        audio_bytes = SpeechService.synthesize_speech(req.text, req.language)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech synthesis failed: {str(e)}")

@router.get("/history", response_model=HistoryResponse)
def get_history(
    q: Optional[str] = Query(None, description="Search query"),
    lang: Optional[str] = Query(None, description="Filter by language code"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve translation history from SQLite."""
    items = HistoryService.get_history(db=db, search_query=q, language_filter=lang, limit=limit)
    return HistoryResponse(
        success=True,
        count=len(items),
        items=[HistoryItemSchema.model_validate(item) for item in items]
    )

@router.delete("/history/{history_id}")
def delete_history_item(history_id: int, db: Session = Depends(get_db)):
    """Delete a specific translation record from history."""
    deleted = HistoryService.delete_record(db, history_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History record not found")
    return {"success": True, "message": f"Deleted history item {history_id}"}

@router.delete("/history")
def clear_all_history(db: Session = Depends(get_db)):
    """Clear all translation history."""
    count = HistoryService.clear_all_history(db)
    return {"success": True, "message": f"Cleared {count} history records", "deleted_count": count}
