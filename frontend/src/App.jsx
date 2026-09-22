import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TranslatorPage from './pages/TranslatorPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { checkHealth, getLanguages, API_BASE_URL } from './services/api';
import { AlertCircle } from 'lucide-react';

const DEFAULT_SETTINGS = {
  defaultSourceLang: 'en',
  defaultTargetLang: 'te',
  autoPlaySpeech: true,
  speechSpeed: 1.0,
  theme: 'dark'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('translator'); // 'translator', 'history', 'settings'
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', database: 'unknown' });
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English', native_name: 'English', speech_code: 'en-US' },
    { code: 'te', name: 'Telugu', native_name: 'తెలుగు', speech_code: 'te-IN' }
  ]);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('talk2talk_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Apply Theme attribute on document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    localStorage.setItem('talk2talk_settings', JSON.stringify(settings));
  }, [settings]);

  // Periodic Backend Health Check & Supported Languages Fetch
  useEffect(() => {
    const runHealthCheck = async () => {
      const res = await checkHealth();
      setBackendStatus(res);
    };

    const runFetchLanguages = async () => {
      const list = await getLanguages();
      if (list && list.length > 0) {
        setLanguages(list);
      }
    };

    runHealthCheck();
    runFetchLanguages();

    const interval = setInterval(runHealthCheck, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSettings = (newPartialSettings) => {
    setSettings(prev => ({ ...prev, ...newPartialSettings }));
  };

  const isOffline = backendStatus?.status !== 'ok';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {isOffline && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.65rem 1rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <b>Backend Offline:</b> Deployed site is configured to connect to <code>{API_BASE_URL}</code>. Deploy your backend on <b>Render</b> and set environment variable <code>VITE_API_URL</code> on Netlify to your Render backend URL.
          </span>
        </div>
      )}

      <main className="app-container">
        {activeTab === 'translator' && (
          <TranslatorPage
            languages={languages}
            settings={settings}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            languages={languages}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            languages={languages}
          />
        )}
      </main>
    </div>
  );
}
