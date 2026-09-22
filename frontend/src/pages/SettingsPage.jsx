import React from 'react';
import { Settings, Volume2, Database, Sun, Moon, Trash2 } from 'lucide-react';
import { clearAllHistory } from '../services/api';

export default function SettingsPage({ settings, onUpdateSettings, languages }) {
  const handleClearDb = async () => {
    if (window.confirm('Are you sure you want to clear all history stored in SQLite database?')) {
      const res = await clearAllHistory();
      if (res.success) {
        alert(`Successfully cleared ${res.deleted_count || 0} history records.`);
      }
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={24} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Application Settings</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Languages default */}
        <div className="person-card" style={{ boxShadow: 'none' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Language Preferences
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Default Source Language
              </label>
              <select
                className="lang-select"
                style={{ width: '100%' }}
                value={settings.defaultSourceLang}
                onChange={(e) => onUpdateSettings({ defaultSourceLang: e.target.value })}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name} ({l.native_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Default Target Language
              </label>
              <select
                className="lang-select"
                style={{ width: '100%' }}
                value={settings.defaultTargetLang}
                onChange={(e) => onUpdateSettings({ defaultTargetLang: e.target.value })}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name} ({l.native_name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Speech Settings */}
        <div className="person-card" style={{ boxShadow: 'none' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 size={18} color="var(--accent-blue)" />
            Speech & Audio
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.autoPlaySpeech}
                onChange={(e) => onUpdateSettings({ autoPlaySpeech: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Auto-play Translated Speech</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Automatically speak translated text after speech recognition finishes
                </div>
              </div>
            </label>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Speech Playback Speed</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{settings.speechSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.speechSpeed}
                onChange={(e) => onUpdateSettings({ speechSpeed: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="person-card" style={{ boxShadow: 'none' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            Appearance
          </h3>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={`control-btn ${settings.theme === 'dark' ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              style={settings.theme === 'dark' ? { backgroundColor: 'var(--accent-blue)', color: '#fff' } : {}}
            >
              <Moon size={16} />
              <span>Dark Theme</span>
            </button>

            <button
              className={`control-btn ${settings.theme === 'light' ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ theme: 'light' })}
              style={settings.theme === 'light' ? { backgroundColor: 'var(--accent-blue)', color: '#fff' } : {}}
            >
              <Sun size={16} />
              <span>Light Theme</span>
            </button>
          </div>
        </div>

        {/* Database */}
        <div className="person-card" style={{ boxShadow: 'none' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} />
            Data & Privacy
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            All history records are stored locally in your SQLite database (<code>talk2talk.db</code>).
          </p>

          <button className="btn-secondary" onClick={handleClearDb} style={{ color: '#ef4444', alignSelf: 'flex-start' }}>
            <Trash2 size={16} />
            <span>Reset SQLite Database History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
