import io
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)

GTTS_LANG_MAP = {
    "en": "en",
    "te": "te",
    "hi": "hi",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ta": "ta",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "bn": "bn",
}

class SpeechService:
    @staticmethod
    def synthesize_speech(text: str, language: str) -> bytes:
        """
        Synthesizes text into MP3 audio bytes using gTTS.
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty for speech synthesis.")

        lang_code = GTTS_LANG_MAP.get(language.lower(), "en")

        try:
            tts = gTTS(text=text.strip(), lang=lang_code, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()
        except Exception as e:
            logger.error(f"gTTS synthesis failed for lang '{language}': {e}")
            raise RuntimeError(f"Speech synthesis failed for language '{language}': {str(e)}")
