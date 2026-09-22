import React from 'react';
import { Mic, MicOff, Volume2, Send, Copy, Check } from 'lucide-react';

export default function TranslationPanel({
  personLabel,
  personBadge,
  languages,
  selectedLanguage,
  onLanguageChange,
  inputText,
  onInputChange,
  translatedText,
  isRecording,
  onStartRecording,
  onStopRecording,
  onTranslate,
  onPlayAudio,
  isPlayingAudio,
  isTranslating,
  isActive
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`person-card ${isActive ? 'active' : ''}`}>
      <div className="person-card-header">
        <div className="person-title">
          <span>{personLabel}</span>
          <span className="person-badge">{personBadge}</span>
        </div>

        <select
          className="lang-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.native_name})
            </option>
          ))}
        </select>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <textarea
          className="text-box"
          placeholder={`Speak or type in ${languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}...`}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isRecording}
        />
      </div>

      <div className="text-output-area-container" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
          TRANSLATED OUTPUT
        </div>
        <div className={`text-output-area ${!translatedText ? 'placeholder' : ''}`}>
          {translatedText || 'Translated text will appear here...'}
        </div>
      </div>

      <div className="action-bar">
        <button
          className={`btn-mic ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isTranslating}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          <span>{isRecording ? 'Listening...' : '🎙 Speak'}</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {inputText && !translatedText && (
            <button
              className="btn-secondary"
              onClick={onTranslate}
              disabled={isTranslating}
            >
              <Send size={16} />
              <span>Translate</span>
            </button>
          )}

          {translatedText && (
            <>
              <button
                className="btn-secondary"
                onClick={handleCopy}
                title="Copy translated text"
              >
                {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                className="btn-secondary"
                onClick={onPlayAudio}
                disabled={isPlayingAudio}
                title="Listen to translated speech"
              >
                <Volume2 size={16} className={isPlayingAudio ? 'spin' : ''} />
                <span>{isPlayingAudio ? 'Speaking...' : '🔊 Play'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
