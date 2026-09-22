import React from 'react';
import { Mic, Loader2, Globe, Volume2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StatusIndicator({ state, message }) {
  if (!state || state === 'idle') return null;

  const renderIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic size={20} className="spin-pulse" />;
      case 'processing':
        return <Loader2 size={20} className="spin" />;
      case 'translating':
        return <Globe size={20} className="spin" />;
      case 'speaking':
        return <Volume2 size={20} className="spin" />;
      case 'completed':
        return <CheckCircle2 size={20} />;
      case 'error':
        return <AlertTriangle size={20} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'listening':
        return 'Listening to your microphone...';
      case 'processing':
        return 'Converting speech to text...';
      case 'translating':
        return 'Translating text...';
      case 'speaking':
        return 'Speaking translated text...';
      case 'completed':
        return 'Translation completed';
      case 'error':
        return 'Operation failed';
      default:
        return '';
    }
  };

  return (
    <div className={`status-indicator ${state}`}>
      {renderIcon()}
      <span>{message || getTitle()}</span>
    </div>
  );
}
