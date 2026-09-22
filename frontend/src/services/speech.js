import { fetchSynthesizeSpeechBlob } from './api';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

let activeRecognition = null;
let currentAudioPlayer = null;

export function isSpeechRecognitionSupported() {
  return !!SpeechRecognition;
}

export function startListening({ lang = 'en-US', onResult, onError, onStart, onEnd }) {
  if (!SpeechRecognition) {
    if (onError) {
      onError({
        code: 'UNSUPPORTED_BROWSER',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.'
      });
    }
    return null;
  }

  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim += transcript;
      }
    }
    if (onResult) {
      onResult({
        final: finalTranscript,
        interim: interim,
        text: finalTranscript || interim
      });
    }
  };

  recognition.onerror = (event) => {
    loggerError('Speech recognition error:', event.error);
    let code = 'RECOGNITION_ERROR';
    let msg = 'Speech recognition error occurred.';

    if (event.error === 'not-allowed') {
      code = 'PERMISSION_DENIED';
      msg = 'Microphone permission was denied. Please allow microphone access in your browser address bar.';
    } else if (event.error === 'no-speech') {
      code = 'NO_SPEECH';
      msg = 'No speech was detected. Please try speaking again.';
    } else if (event.error === 'audio-capture') {
      code = 'NO_MICROPHONE';
      msg = 'No microphone was found on your device.';
    } else if (event.error === 'network') {
      code = 'NETWORK_ERROR';
      msg = 'Network error occurred during speech recognition.';
    }

    if (onError) onError({ code, message: msg });
  };

  recognition.onend = () => {
    activeRecognition = null;
    if (onEnd) onEnd(finalTranscript);
  };

  try {
    recognition.start();
    activeRecognition = recognition;
    return recognition;
  } catch (err) {
    if (onError) onError({ code: 'START_FAILED', message: err.message });
    return null;
  }
}

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
    activeRecognition = null;
  }
}

function loggerError(...args) {
  console.error('[SpeechService]', ...args);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioPlayer) {
    try {
      currentAudioPlayer.pause();
      currentAudioPlayer.currentTime = 0;
    } catch (e) {}
    currentAudioPlayer = null;
  }
}

export async function speakText({ text, lang = 'te', speechCode = 'te-IN', rate = 1.0, onStart, onEnd, onError }) {
  stopSpeaking();

  if (!text || !text.strip ? !text.trim() : !text) {
    if (onError) onError({ code: 'EMPTY_TEXT', message: 'No text provided for speech playback.' });
    return;
  }

  const cleanText = text.trim();

  // Try browser Web Speech Synthesis first
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    const hasMatchingVoice = voices.some(v => v.lang.toLowerCase().includes(lang.toLowerCase()) || v.lang.toLowerCase().includes(speechCode.toLowerCase()));

    if (voices.length > 0 && hasMatchingVoice) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = speechCode || lang;
        utterance.rate = rate;

        const targetVoice = voices.find(v => v.lang.toLowerCase().includes(speechCode.toLowerCase())) ||
                            voices.find(v => v.lang.toLowerCase().includes(lang.toLowerCase()));

        if (targetVoice) {
          utterance.voice = targetVoice;
        }

        utterance.onstart = () => { if (onStart) onStart(); };
        utterance.onend = () => { if (onEnd) onEnd(); };
        utterance.onerror = (e) => {
          console.warn('[SpeechService] Browser TTS error, falling back to backend gTTS...', e);
          fallbackToBackendSpeech({ text: cleanText, lang, rate, onStart, onEnd, onError });
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn('[SpeechService] Browser TTS exception, using backend gTTS fallback...');
      }
    }
  }

  // Fallback to backend gTTS MP3 synthesis endpoint
  await fallbackToBackendSpeech({ text: cleanText, lang, rate, onStart, onEnd, onError });
}

async function fallbackToBackendSpeech({ text, lang, rate, onStart, onEnd, onError }) {
  try {
    const blob = await fetchSynthesizeSpeechBlob(text, lang);
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudioPlayer = audio;
    audio.playbackRate = rate;

    audio.onplay = () => { if (onStart) onStart(); };
    audio.onended = () => {
      currentAudioPlayer = null;
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    };
    audio.onerror = (err) => {
      currentAudioPlayer = null;
      URL.revokeObjectURL(audioUrl);
      if (onError) onError({ code: 'TTS_FAILED', message: 'Failed to play synthesized audio.' });
    };

    await audio.play();
  } catch (err) {
    if (onError) onError({ code: 'TTS_FAILED', message: err.message || 'Speech synthesis failed.' });
  }
}
