# 🗣️ Talk2Talk — Local Voice-to-Voice Translator

> *"Speak naturally. Understand instantly."*

**Talk2Talk** is a real, complete, full-stack local voice-to-voice translation application that enables real-time two-way spoken conversation between users speaking different languages (primary focus: **English** and **Telugu**).

Running entirely on `localhost`, Talk2Talk combines browser-native speech recognition (Web Speech API), backend multi-provider translation services, text-to-speech audio synthesis (`gTTS` & Web Speech API), and SQLite persistence for conversation history.

---

## 🌟 Key Features

- **🎙 Real Microphone Voice Capture**: Browser-native microphone recording with permission detection and error handling.
- **🗣 Multi-Language Speech-to-Text**: Converts spoken English and Telugu (and 9+ additional languages) into text in real-time.
- **🌐 Robust Translation Pipeline**: High-accuracy translation engine supporting English ↔ Telugu with automatic multi-tier fallbacks (Google Translator & MyMemory Translator).
- **🔊 Text-to-Speech (TTS) Synthesis**: Automatic audio playback of translated text using native Web Speech Synthesis paired with backend `gTTS` fallback for 100% reliable voice playback.
- **💬 Visual Turn-by-Turn Conversation Mode**: Real-time chat bubbles displaying Person A and Person B original and translated sentences with replay controls.
- **📚 Useful Phrasebook**: Categorized library of travel, emergency, hotel, dining, shopping, and conversation phrases with one-click translate and speak.
- **💾 Local SQLite History**: Automatic persistence of all translations in `talk2talk.db` using SQLAlchemy with live search, language filtering, individual record deletion, and clear history.
- **⚙️ Configurable Settings**: Customizable default source/target languages, auto-play speech toggle, playback speed rate (0.5x to 1.5x), dark/light appearance theme, and database reset.
- **🟢 Live Backend Connection Health Indicator**: Header status badge showing backend API and SQLite database connection status.

---

## 🏗 Architecture & Stack

### Frontend
- **React (v18)** + **Vite**
- **JavaScript (ES6+)**
- **Lucide React** (Modern clean icon library)
- **HTML5 Web Speech API** (`SpeechRecognition` & `SpeechSynthesis`)

### Backend
- **Python 3.10+**
- **FastAPI** + **Uvicorn**
- **SQLAlchemy** + **SQLite** (`talk2talk.db`)
- **Pydantic v2** & **pydantic-settings**
- **deep-translator** + **gTTS** (Google Text-to-Speech)

---

## 📂 Project Structure

```
talk2talk/
│
├── frontend/                     # React Vite Frontend App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # App navigation & connection badge
│   │   │   ├── TranslationPanel.jsx # Speaker card with mic, text area & play audio
│   │   │   ├── ConversationView.jsx # Turn-by-turn chat timeline
│   │   │   ├── StatusIndicator.jsx  # Multi-stage operation status (Listening, Translating, etc.)
│   │   │   ├── Phrasebook.jsx       # Categorized phrase library
│   │   │   └── ErrorMessage.jsx     # User-friendly error alert cards
│   │   ├── pages/
│   │   │   ├── TranslatorPage.jsx   # Core voice-to-voice translation view
│   │   │   ├── HistoryPage.jsx      # SQLite search/filter history page
│   │   │   └── SettingsPage.jsx     # User preferences & database reset
│   │   ├── services/
│   │   │   ├── api.js               # REST API fetch client
│   │   │   └── speech.js            # Browser STT & TTS with gTTS fallback
│   │   ├── App.jsx                  # Main application component & router
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Custom CSS styling & themes
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                      # FastAPI Python Backend App
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py            # FastAPI endpoints (translate, health, speech, history)
│   │   ├── core/
│   │   │   └── config.py            # Environment settings & CORS config
│   │   ├── database/
│   │   │   └── session.py           # SQLAlchemy SQLite engine setup
│   │   ├── models/
│   │   │   └── history.py           # TranslationHistory database table
│   │   ├── schemas/
│   │   │   └── translation.py       # Pydantic schemas
│   │   ├── services/
│   │   │   ├── translation_service.py # Multi-tier translation engine
│   │   │   ├── speech_service.py      # gTTS audio synthesis engine
│   │   │   └── history_service.py     # Database CRUD service
│   │   └── main.py                  # FastAPI app entry point & CORS
│   ├── tests/
│   │   └── test_api.py              # Pytest backend test suite
│   ├── requirements.txt             # Python backend dependencies
│   ├── .env.example                 # Environment variables template
│   └── .env                         # Environment variables configuration
│
├── README.md                     # Documentation
└── .gitignore                    # Git ignore rules
```

---

## ⚙️ Quick Start & Running Locally

### 1. Backend Setup

Open a terminal window:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend server will run at:
- **API URL**: `http://localhost:8000/api`
- **Health Check**: `http://localhost:8000/api/health`
- **Swagger API Documentation**: `http://localhost:8000/docs`

---

### 2. Frontend Setup

Open a second terminal window:

```bash
cd frontend

# Install node packages
npm install

# Start Vite dev server
npm run dev
```

The frontend will run at:
- **App URL**: `http://localhost:5173`

---

## 🔑 Environment Variables Configuration

The backend reads configuration from `backend/.env`. A `.env.example` template is provided:

```env
TRANSLATION_API_KEY=
TRANSLATION_PROVIDER=google
DATABASE_URL=sqlite:///./talk2talk.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DEFAULT_SOURCE_LANG=en
DEFAULT_TARGET_LANG=te
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & database connectivity check |
| `GET` | `/api/languages` | Returns list of supported language codes & names |
| `POST` | `/api/translate` | Translates text & optionally stores in SQLite history |
| `POST` | `/api/speech/synthesize` | Generates MP3 audio byte stream for TTS |
| `GET` | `/api/history` | Retrieves stored translation history (supports `q` & `lang` filter) |
| `DELETE` | `/api/history/{id}` | Deletes a specific translation record |
| `DELETE` | `/api/history` | Clears all stored translation records |

---

## 🌐 Supported Languages

- **English (`en`)**
- **Telugu (`te`)**
- **Hindi (`hi`)**
- **Spanish (`es`)**
- **French (`fr`)**
- **German (`de`)**
- **Tamil (`ta`)**
- **Kannada (`kn`)**
- **Malayalam (`ml`)**
- **Marathi (`mr`)**
- **Bengali (`bn`)**

---

## 🎙 Microphone Permissions & Browser Requirements

- **Supported Browsers**: Google Chrome, Microsoft Edge, Safari.
- **Microphone Access**: Secure contexts (`https://` or `http://localhost`) allow browser microphone access. Make sure to click **Allow** when prompted for microphone permission by the browser.

---

## 🧪 Testing

To run backend tests with pytest:

```bash
cd backend
.\venv\Scripts\activate
pytest -v
```

All 6 tests verify health check, language list, translation accuracy, error validation, speech synthesis, and database CRUD history operations.

---

## 📜 License

MIT License. Developed for local voice-to-voice translation.
