import React, { useRef, useEffect } from 'react';
import { Volume2, MessageSquare, Trash2, User } from 'lucide-react';

export default function ConversationView({ conversation, onPlayBubbleAudio, onClearConversation, languages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation && conversation.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  if (!conversation || conversation.length === 0) {
    return (
      <div className="conversation-section">
        <div className="conversation-header">
          <div className="conversation-title">
            <MessageSquare size={20} color="var(--accent-blue)" />
            <span>Live Conversation Timeline</span>
          </div>
        </div>
        <div className="conversation-empty-state">
          <MessageSquare size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No Spoken Messages Yet
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Tap 🎙 <b>Speak</b> on Person A or Person B above to start translating in real-time.
          </div>
        </div>
      </div>
    );
  }

  const getLangName = (code) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="conversation-section">
      <div className="conversation-header">
        <div className="conversation-title">
          <MessageSquare size={20} color="var(--accent-blue)" />
          <span>Live Conversation ({conversation.length} turn{conversation.length > 1 ? 's' : ''})</span>
        </div>
        <button
          className="btn-secondary"
          onClick={onClearConversation}
          title="Clear active conversation"
        >
          <Trash2 size={16} />
          <span>Clear Chat</span>
        </button>
      </div>

      <div className="chat-timeline">
        {conversation.map((turn, index) => {
          const isPersonA = turn.speaker === 'Person A';
          return (
            <div
              key={index}
              className={`chat-bubble ${isPersonA ? 'person-a' : 'person-b'}`}
            >
              <div className="bubble-header">
                <div className="bubble-speaker-tag">
                  <div className={`avatar-icon ${isPersonA ? 'avatar-a' : 'avatar-b'}`}>
                    <User size={14} />
                  </div>
                  <span>{turn.speaker}</span>
                  <span className="lang-tag">
                    {getLangName(turn.sourceLang)} → {getLangName(turn.targetLang)}
                  </span>
                </div>
                <span className="bubble-time">{turn.timestamp || 'Just now'}</span>
              </div>

              <div className="bubble-original">
                "{turn.originalText}"
              </div>

              <div className="bubble-translated">
                "{turn.translatedText}"
              </div>

              <div className="bubble-actions">
                <button
                  className="btn-play-bubble"
                  onClick={() => onPlayBubbleAudio(turn.translatedText, turn.targetLang)}
                  title="Play speech audio"
                >
                  <Volume2 size={14} />
                  <span>Play Speech</span>
                </button>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
