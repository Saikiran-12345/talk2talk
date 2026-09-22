import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TranslatorPage from './pages/TranslatorPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { checkHealth, getLanguages } from './services/api';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

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
