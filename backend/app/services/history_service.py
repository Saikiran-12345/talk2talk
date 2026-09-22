from sqlalchemy.orm import Session
from app.models.history import TranslationHistory
from typing import List, Optional

class HistoryService:
    @staticmethod
    def create_history_record(
        db: Session,
        source_lang: str,
        target_lang: str,
        original_text: str,
        translated_text: str
    ) -> TranslationHistory:
        record = TranslationHistory(
            source_language=source_lang,
            target_language=target_lang,
            original_text=original_text,
            translated_text=translated_text
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_history(
        db: Session,
        search_query: Optional[str] = None,
        language_filter: Optional[str] = None,
        limit: int = 100
    ) -> List[TranslationHistory]:
        query = db.query(TranslationHistory)
        if language_filter:
            query = query.filter(
                (TranslationHistory.source_language == language_filter) | 
                (TranslationHistory.target_language == language_filter)
            )
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (TranslationHistory.original_text.ilike(q)) | 
                (TranslationHistory.translated_text.ilike(q))
            )
        return query.order_by(TranslationHistory.created_at.desc()).limit(limit).all()

    @staticmethod
    def delete_record(db: Session, history_id: int) -> bool:
        record = db.query(TranslationHistory).filter(TranslationHistory.id == history_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

    @staticmethod
    def clear_all_history(db: Session) -> int:
        count = db.query(TranslationHistory).delete()
        db.commit()
        return count
