import React from 'react';
import { Languages, History, Settings, MessageSquare } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, backendStatus }) {
  const isConnected = backendStatus?.status === 'ok';

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          🗣️
        </div>
        <div>
          <span>TALK2TALK</span>
          <span className="tagline">Speak naturally. Understand instantly.</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className={`status-badge ${isConnected ? 'connected' : 'offline'}`} title={`Backend: http://localhost:8000 (${backendStatus?.database || 'offline'})`}>
          <span className="status-dot"></span>
          <span>{isConnected ? 'Backend Connected' : 'Backend Offline'}</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'translator' ? 'active' : ''}`}
            onClick={() => setActiveTab('translator')}
          >
            <Languages size={18} />
            <span>Translator</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            <span>History</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
