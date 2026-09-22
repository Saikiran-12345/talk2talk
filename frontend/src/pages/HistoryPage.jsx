import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Volume2, Filter, Loader2 } from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../services/api';
import { speakText } from '../services/speech';

export default function HistoryPage({ languages }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    const res = await getHistory(searchQuery, selectedLangFilter);
    if (res.success) {
      setHistoryItems(res.items || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [searchQuery, selectedLangFilter]);

  const handleDeleteItem = async (id) => {
    const res = await deleteHistoryItem(id);
    if (res.success) {
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all translation history?')) {
      const res = await clearAllHistory();
      if (res.success) {
        setHistoryItems([]);
      }
    }
  };

  const handlePlayAudio = (item) => {
    setPlayingId(item.id);
    const speechCode = languages.find(l => l.code === item.target_language)?.speech_code || item.target_language;

    speakText({
      text: item.translated_text,
      lang: item.target_language,
      speechCode,
      onStart: () => setPlayingId(item.id),
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null)
    });
  };

  const getLangName = (code) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={24} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Translation History</h2>
        </div>

        {historyItems.length > 0 && (
          <button className="btn-secondary" onClick={handleClearAll} style={{ color: '#ef4444' }}>
            <Trash2 size={16} />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-search"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search saved translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="lang-select"
            value={selectedLangFilter}
            onChange={(e) => setSelectedLangFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
          <div>Loading translation history from SQLite...</div>
        </div>
      ) : historyItems.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No stored translation records found.
        </div>
      ) : (
        <div className="history-list">
          {historyItems.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                    {getLangName(item.source_language)} → {getLangName(item.target_language)}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>

                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  "{item.original_text}"
                </div>

                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  "{item.translated_text}"
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handlePlayAudio(item)}
                  disabled={playingId === item.id}
                  title="Play audio"
                >
                  <Volume2 size={16} className={playingId === item.id ? 'spin' : ''} />
                  <span>Play</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete record"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
