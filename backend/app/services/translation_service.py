import time
import logging
from typing import Dict, List, Tuple
from deep_translator import GoogleTranslator, MyMemoryTranslator
from app.schemas.translation import LanguageOption

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES: List[Dict[str, str]] = [
    {"code": "en", "name": "English", "native_name": "English", "speech_code": "en-US"},
    {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "speech_code": "te-IN"},
    {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "speech_code": "hi-IN"},
    {"code": "es", "name": "Spanish", "native_name": "Español", "speech_code": "es-ES"},
    {"code": "fr", "name": "French", "native_name": "Français", "speech_code": "fr-FR"},
    {"code": "de", "name": "German", "native_name": "Deutsch", "speech_code": "de-DE"},
    {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "speech_code": "ta-IN"},
    {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "speech_code": "kn-IN"},
    {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "speech_code": "ml-IN"},
    {"code": "mr", "name": "Marathi", "native_name": "మరాठी", "speech_code": "mr-IN"},
    {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "speech_code": "bn-IN"},
]

SUPPORTED_CODES = {lang["code"] for lang in SUPPORTED_LANGUAGES}

MYMEMORY_LANG_MAP = {
    "en": "en-GB",
    "te": "te-IN",
    "hi": "hi-IN",
    "es": "es-ES",
    "fr": "fr-FR",
    "de": "de-DE",
    "ta": "ta-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "bn": "bn-IN",
}

class TranslationService:
    @staticmethod
    def get_supported_languages() -> List[LanguageOption]:
        return [LanguageOption(**lang) for lang in SUPPORTED_LANGUAGES]

    @staticmethod
    def translate(text: str, source_lang: str, target_lang: str) -> Tuple[bool, str, float, str]:
        """
        Translates text from source_lang to target_lang.
        Returns (success: bool, result_or_error_text: str, duration_ms: float, error_code: str)
        """
        start_time = time.time()

        if not text or not text.strip():
            return False, "Input text cannot be empty.", 0.0, "EMPTY_INPUT"

        if source_lang not in SUPPORTED_CODES:
            return False, f"Unsupported source language: '{source_lang}'.", 0.0, "UNSUPPORTED_LANGUAGE"

        if target_lang not in SUPPORTED_CODES:
            return False, f"Unsupported target language: '{target_lang}'.", 0.0, "UNSUPPORTED_LANGUAGE"

        if source_lang == target_lang:
            return True, text.strip(), 0.0, ""

        clean_text = text.strip()

        # Tier 1: Try GoogleTranslator via deep-translator
        try:
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated = translator.translate(clean_text)
            duration_ms = (time.time() - start_time) * 1000
            if translated and len(translated.strip()) > 0:
                return True, translated.strip(), duration_ms, ""
        except Exception as primary_exc:
            logger.warning(f"GoogleTranslator primary failed: {primary_exc}. Attempting MyMemory fallback...")

        # Tier 2: Try MyMemoryTranslator with mapped language codes
        try:
            src_mm = MYMEMORY_LANG_MAP.get(source_lang, source_lang)
            tgt_mm = MYMEMORY_LANG_MAP.get(target_lang, target_lang)
            fallback_translator = MyMemoryTranslator(source=src_mm, target=tgt_mm)
            translated = fallback_translator.translate(clean_text)
            duration_ms = (time.time() - start_time) * 1000
            if translated and len(translated.strip()) > 0:
                return True, translated.strip(), duration_ms, ""
        except Exception as fallback_exc:
            logger.error(f"MyMemoryTranslator fallback failed: {fallback_exc}")

        duration_ms = (time.time() - start_time) * 1000
        return False, "Translation service is currently unreachable. Please check your network connection.", duration_ms, "SERVICE_UNAVAILABLE"
