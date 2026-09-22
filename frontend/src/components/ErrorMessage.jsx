import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: '#fca5a5'
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, fontSize: '0.9rem' }}>
        <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.2rem' }}>
          {error.code ? `Error: ${error.code}` : 'Error'}
        </div>
        <div>{error.message || 'An unexpected error occurred. Please try again.'}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#fca5a5',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
