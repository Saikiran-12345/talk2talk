from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to translate")
    source_language: str = Field(..., json_schema_extra={"example": "en"}, description="Source language code")
    target_language: str = Field(..., json_schema_extra={"example": "te"}, description="Target language code")
    save_to_history: bool = Field(True, description="Whether to persist in SQLite history")

class TranslationResponse(BaseModel):
    success: bool
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    history_id: Optional[int] = None
    execution_time_ms: Optional[float] = None
    error: Optional[Dict[str, str]] = None

class SpeechSynthesisRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to convert to speech")
    language: str = Field(..., json_schema_extra={"example": "te"}, description="Language code")

class HistoryItemSchema(BaseModel):
    id: int
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HistoryResponse(BaseModel):
    success: bool
    count: int
    items: List[HistoryItemSchema]

class LanguageOption(BaseModel):
    code: str
    name: str
    native_name: str
    speech_code: str
