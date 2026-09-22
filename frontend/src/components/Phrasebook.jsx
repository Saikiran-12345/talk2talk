import React, { useState } from 'react';
import { BookOpen, Volume2, ArrowRight } from 'lucide-react';

const PHRASE_CATEGORIES = [
  {
    name: 'Travel & Transport',
    phrases: [
      { en: 'Where is the railway station?', te: 'రైల్వే స్టేషన్ ఎక్కడ ఉంది?' },
      { en: 'Where is the airport?', te: 'విమానాశ్రయం ఎక్కడ ఉంది?' },
      { en: 'How much is the bus ticket?', te: 'బస్సు టికెట్ ఎంత?' },
      { en: 'Can you take me to this address?', te: 'నన్ను ఈ చిరునామాకు తీసుకెళ్లగలరా?' }
    ]
  },
  {
    name: 'Emergency & Help',
    phrases: [
      { en: 'I need help.', te: 'నాకు సహాయం కావాలి.' },
      { en: 'Please call an ambulance.', te: 'దయచేసి అంబులెన్స్‌ను పిలవండి.' },
      { en: 'Where is the nearest hospital?', te: 'సమీపంలోని ఆసుపత్రి ఎక్కడ ఉంది?' },
      { en: 'I lost my wallet.', te: 'నా పర్స్ పోయింది.' }
    ]
  },
  {
    name: 'Hotel & Dining',
    phrases: [
      { en: 'Do you have a room available?', te: 'మీ దగ్గర గది అందుబాటులో ఉందా?' },
      { en: 'Where is a good restaurant near here?', te: 'ఇక్కడ దగ్గరలో మంచి రెస్టారెంట్ ఎక్కడ ఉంది?' },
      { en: 'Could I have the menu, please?', te: 'దయచేసి మెనూ ఇస్తారా?' },
      { en: 'The food was delicious.', te: 'ఆహారం చాలా రుచిగా ఉంది.' }
    ]
  },
  {
    name: 'Shopping & Prices',
    phrases: [
      { en: 'How much does this cost?', te: 'దీని ధర ఎంత?' },
      { en: 'Do you accept credit cards?', te: 'మీరు క్రెడిట్ కార్డులు అంగీకరిస్తారా?' },
      { en: 'Can you give me a discount?', te: 'నాకు కొంత తగ్గింపు ఇవ్వగలరా?' }
    ]
  },
  {
    name: 'Basic Conversation',
    phrases: [
      { en: 'Hello, how are you?', te: 'నమస్కారం, మీరు ఎలా ఉన్నారు?' },
      { en: 'Thank you very much.', te: 'చాలా ధన్యవాదాలు.' },
      { en: 'Nice to meet you.', te: 'మిమ్మల్ని కలవడం సంతోషంగా ఉంది.' },
      { en: 'I speak a little English.', te: 'నేను కొద్దిగా ఇంగ్లీష్ మాట్లాడతాను.' }
    ]
  }
];

export default function Phrasebook({ onSelectPhrase }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const activeCategory = PHRASE_CATEGORIES[activeCategoryIndex];

  return (
    <div className="phrasebook-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <BookOpen size={20} color="var(--accent-purple)" />
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Useful Phrasebook</span>
      </div>

      <div className="category-pills">
        {PHRASE_CATEGORIES.map((cat, idx) => (
          <button
            key={idx}
            className={`cat-pill ${activeCategoryIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveCategoryIndex(idx)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="phrase-grid">
        {activeCategory.phrases.map((item, idx) => (
          <div
            key={idx}
            className="phrase-card"
            onClick={() => onSelectPhrase(item)}
            title="Click to translate and speak"
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {item.en}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                {item.te}
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}
