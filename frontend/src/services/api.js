export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function getLanguages() {
  try {
    const res = await fetch(`${API_BASE_URL}/languages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch languages:', err);
    return [
      { code: 'en', name: 'English', native_name: 'English', speech_code: 'en-US' },
      { code: 'te', name: 'Telugu', native_name: 'తెలుగు', speech_code: 'te-IN' }
    ];
  }
}

export async function translateText({ text, source_language, target_language, save_to_history = true }) {
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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to translation server.'
      }
    };
  }
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch history:', err);
    return { success: false, items: [], count: 0 };
  }
}

export async function deleteHistoryItem(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/history/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function clearAllHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
