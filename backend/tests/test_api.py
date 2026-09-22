import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Talk2Talk Local Voice Translator"
    assert "database" in data

def test_get_languages():
    response = client.get("/api/languages")
    assert response.status_code == 200
    languages = response.json()
    assert isinstance(languages, list)
    codes = [lang["code"] for lang in languages]
    assert "en" in codes
    assert "te" in codes

def test_translation_success():
    payload = {
        "text": "Hello world",
        "source_language": "en",
        "target_language": "te",
        "save_to_history": True
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["source_language"] == "en"
    assert data["target_language"] == "te"
    assert len(data["translated_text"]) > 0

def test_translation_empty_text():
    payload = {
        "text": "",
        "source_language": "en",
        "target_language": "te"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 422 # Pydantic validation error

def test_translation_unsupported_language():
    payload = {
        "text": "Hello",
        "source_language": "invalid_code",
        "target_language": "te"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNSUPPORTED_LANGUAGE"

def test_history_crud():
    # 1. Translate something to save history
    payload = {
        "text": "Where is the railway station?",
        "source_language": "en",
        "target_language": "te",
        "save_to_history": True
    }
    res = client.post("/api/translate", json=payload)
    assert res.status_code == 200
    history_id = res.json()["history_id"]
    assert history_id is not None

    # 2. Get history
    res_get = client.get("/api/history")
    assert res_get.status_code == 200
    history_data = res_get.json()
    assert history_data["success"] is True
    assert history_data["count"] >= 1

    # 3. Delete individual history item
    res_del = client.delete(f"/api/history/{history_id}")
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True
