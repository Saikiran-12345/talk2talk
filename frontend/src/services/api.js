export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend health check offline, using Web Client mode.', err);
  }
  return { status: 'ok', service: 'Talk2Talk Web Translator', database: 'local-browser' };
}

export async function getLanguages() {
  try {
    const res = await fetch(`${API_BASE_URL}/languages`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Languages fetch offline, returning default languages.', err);
  }
  return [
    { code: 'en', name: 'English', native_name: 'English', speech_code: 'en-US' },
    { code: 'te', name: 'Telugu', native_name: 'తెలుగు', speech_code: 'te-IN' },
    { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', speech_code: 'hi-IN' },
    { code: 'es', name: 'Spanish', native_name: 'Español', speech_code: 'es-ES' },
    { code: 'fr', name: 'French', native_name: 'Français', speech_code: 'fr-FR' },
    { code: 'de', name: 'German', native_name: 'Deutsch', speech_code: 'de-DE' },
    { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', speech_code: 'ta-IN' }
  ];
}

export async function translateText({ text, source_language, target_language, save_to_history = true }) {
  // 1. Try Backend API endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source_language,
        target_language,
        save_to_history
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn('Backend translate endpoint unreachable, utilizing fallback web engine...', err);
  }

  // 2. High-reliability Fallback Web Translation Engine
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source_language}&tl=${target_language}&dt=t&q=${encodeURIComponent(text)}`;
    const fallbackRes = await fetch(url);
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const translatedText = data[0].map(item => item[0]).join('');
      if (translatedText && translatedText.trim()) {
        return {
          success: true,
          source_language,
          target_language,
          original_text: text,
          translated_text: translatedText.trim()
        };
      }
    }
  } catch (fallbackErr) {
    console.error('Fallback web translation error:', fallbackErr);
  }

  return {
    success: false,
    error: {
      code: 'TRANSLATION_FAILED',
      message: 'Translation service is unavailable. Please check your network connection.'
    }
  };
}

export function getSynthesizeSpeechUrl(text, language) {
  return `${API_BASE_URL}/speech/synthesize?t=${Date.now()}`;
}

export async function fetchSynthesizeSpeechBlob(text, language) {
  const res = await fetch(`${API_BASE_URL}/speech/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
  if (!res.ok) throw new Error(`Speech synthesis error HTTP ${res.status}`);
  return await res.blob();
}

export async function getHistory(q = '', lang = '') {
  try {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (lang) params.append('lang', lang);
    const res = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch backend history:', err);
  }
  return { success: true, items: [], count: 0 };
}

export async function deleteHistoryItem(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/history/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function clearAllHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
