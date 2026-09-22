import React, { useState, useEffect } from 'react';
import TranslationPanel from '../components/TranslationPanel';
import StatusIndicator from '../components/StatusIndicator';
import ConversationView from '../components/ConversationView';
import Phrasebook from '../components/Phrasebook';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeftRight, Trash2, VolumeX } from 'lucide-react';
import { translateText } from '../services/api';
import { startListening, stopListening, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../services/speech';

export default function TranslatorPage({ languages, settings }) {
  const [langA, setLangA] = useState(settings?.defaultSourceLang || 'en');
  const [langB, setLangB] = useState(settings?.defaultTargetLang || 'te');

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');

  const [translatedA, setTranslatedA] = useState('');
  const [translatedB, setTranslatedB] = useState('');

  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'A' or 'B'
  const [recordingState, setRecordingState] = useState(null); // 'listening', 'processing', 'translating', 'speaking', 'completed', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState(null);

  const [conversation, setConversation] = useState([]);

  // Auto-sync defaults from settings if changed
  useEffect(() => {
    if (settings?.defaultSourceLang) setLangA(settings.defaultSourceLang);
    if (settings?.defaultTargetLang) setLangB(settings.defaultTargetLang);
  }, [settings]);

  // Swap Languages
  const handleSwapLanguages = () => {
    stopSpeaking();
    stopListening();
    const tempLang = langA;
    setLangA(langB);
    setLangB(tempLang);

    const tempInput = inputA;
    setInputA(inputB);
    setInputB(tempInput);

    const tempTranslated = translatedA;
    setTranslatedA(translatedB);
    setTranslatedB(tempTranslated);
  };

  // Clear Conversation
  const handleClearConversation = () => {
    stopSpeaking();
    stopListening();
    setInputA('');
    setInputB('');
    setTranslatedA('');
    setTranslatedB('');
    setConversation([]);
    setRecordingState(null);
    setError(null);
  };

  // Stop Speaking / Active Audio
  const handleStopSpeaking = () => {
    stopSpeaking();
    stopListening();
    setIsPlayingAudio(false);
    if (recordingState === 'speaking' || recordingState === 'listening') {
      setRecordingState(null);
    }
  };

  // Execute Translation & TTS Pipeline for Person A or Person B
  const executeTranslationPipeline = async (speaker, sourceText, srcLang, tgtLang) => {
    if (!sourceText || !sourceText.trim()) {
      setError({ code: 'EMPTY_INPUT', message: 'Please speak or type a sentence to translate.' });
      setRecordingState(null);
      return;
    }

    setError(null);
    setActiveSpeaker(speaker);
    setRecordingState('translating');
    setStatusMessage(`Translating from ${getLangName(srcLang)} to ${getLangName(tgtLang)}...`);

    const res = await translateText({
      text: sourceText,
      source_language: srcLang,
      target_language: tgtLang,
      save_to_history: true
    });

    if (!res.success) {
      setRecordingState('error');
      setError({
        code: res.error?.code || 'TRANSLATION_FAILED',
        message: res.error?.message || 'Translation failed. Please try again.'
      });
      return;
    }

    const resultText = res.translated_text;

    if (speaker === 'A') {
      setTranslatedA(resultText);
    } else {
      setTranslatedB(resultText);
    }

    // Add to conversation timeline
    const newTurn = {
      speaker: speaker === 'A' ? 'Person A' : 'Person B',
      sourceLang: srcLang,
      targetLang: tgtLang,
      originalText: sourceText,
      translatedText: resultText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversation(prev => [...prev, newTurn]);

    // Handle Text-To-Speech if auto-play enabled
    if (settings?.autoPlaySpeech !== false) {
      setRecordingState('speaking');
      setStatusMessage(`Speaking translated text in ${getLangName(tgtLang)}...`);
      setIsPlayingAudio(true);

      const targetSpeechCode = languages.find(l => l.code === tgtLang)?.speech_code || tgtLang;

      await speakText({
        text: resultText,
        lang: tgtLang,
        speechCode: targetSpeechCode,
        rate: settings?.speechSpeed || 1.0,
        onStart: () => {
          setIsPlayingAudio(true);
        },
        onEnd: () => {
          setIsPlayingAudio(false);
          setRecordingState('completed');
          setStatusMessage('Translation completed successfully');
          setTimeout(() => setRecordingState(null), 3000);
        },
        onError: (err) => {
          setIsPlayingAudio(false);
          setRecordingState('completed');
          console.warn('TTS playback issue:', err);
        }
      });
    } else {
      setRecordingState('completed');
      setStatusMessage('Translation completed');
      setTimeout(() => setRecordingState(null), 3000);
    }
  };

  // Start Mic Recording for Person A or Person B
  const handleStartRecording = (speaker) => {
    stopSpeaking();
    setError(null);

    if (!isSpeechRecognitionSupported()) {
      setError({
        code: 'UNSUPPORTED_BROWSER',
        message: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      });
      return;
    }

    setActiveSpeaker(speaker);
    setRecordingState('listening');

    const srcLang = speaker === 'A' ? langA : langB;
    const tgtLang = speaker === 'A' ? langB : langA;
    const srcSpeechCode = languages.find(l => l.code === srcLang)?.speech_code || srcLang;

    if (speaker === 'A') {
      setInputA('');
      setTranslatedA('');
    } else {
      setInputB('');
      setTranslatedB('');
    }

    startListening({
      lang: srcSpeechCode,
      onStart: () => {
        setRecordingState('listening');
        setStatusMessage(`Listening to Person ${speaker} (${getLangName(srcLang)})...`);
      },
      onResult: (res) => {
        if (speaker === 'A') {
          setInputA(res.text);
        } else {
          setInputB(res.text);
        }
      },
      onEnd: (finalText) => {
        if (finalText && finalText.trim()) {
          setRecordingState('processing');
          setStatusMessage('Speech captured. Processing translation...');
          executeTranslationPipeline(speaker, finalText, srcLang, tgtLang);
        } else {
          setRecordingState(null);
        }
      },
      onError: (err) => {
        setRecordingState('error');
        setError(err);
      }
    });
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const getLangName = (code) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  // Play audio from bubble or output
  const handlePlayAudio = (text, tgtLang) => {
    const speechCode = languages.find(l => l.code === tgtLang)?.speech_code || tgtLang;
    setIsPlayingAudio(true);
    setRecordingState('speaking');
    setStatusMessage(`Speaking translated text in ${getLangName(tgtLang)}...`);

    speakText({
      text,
      lang: tgtLang,
      speechCode,
      rate: settings?.speechSpeed || 1.0,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setRecordingState(null);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setRecordingState(null);
      }
    });
  };

  // Handle phrase selected from phrasebook
  const handleSelectPhrase = (phraseItem) => {
    stopSpeaking();
    stopListening();
    setInputA(phraseItem.en);
    setTranslatedA(phraseItem.te);
    executeTranslationPipeline('A', phraseItem.en, langA, langB);
  };

  return (
    <div>
      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      <StatusIndicator state={recordingState} message={statusMessage} />

      {/* Global Controls */}
      <div className="global-controls">
        <button className="control-btn" onClick={handleSwapLanguages} title="Swap source and target languages">
          <ArrowLeftRight size={18} />
          <span>Swap Languages</span>
        </button>

        <button className="control-btn" onClick={handleStopSpeaking} title="Stop active speech playback or mic">
          <VolumeX size={18} />
          <span>Stop Speaking</span>
        </button>

        <button className="control-btn" onClick={handleClearConversation} title="Clear conversation history">
          <Trash2 size={18} />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Two Conversation Panels */}
      <div className="translator-grid">
        <TranslationPanel
          personLabel="PERSON A"
          personBadge="Speaker 1"
          languages={languages}
          selectedLanguage={langA}
          onLanguageChange={setLangA}
          inputText={inputA}
          onInputChange={setInputA}
          translatedText={translatedA}
          isRecording={recordingState === 'listening' && activeSpeaker === 'A'}
          onStartRecording={() => handleStartRecording('A')}
          onStopRecording={handleStopRecording}
          onTranslate={() => executeTranslationPipeline('A', inputA, langA, langB)}
          onPlayAudio={() => handlePlayAudio(translatedA, langB)}
          isPlayingAudio={isPlayingAudio && activeSpeaker === 'A'}
          isTranslating={recordingState === 'translating'}
          isActive={activeSpeaker === 'A'}
        />

        <TranslationPanel
          personLabel="PERSON B"
          personBadge="Speaker 2"
          languages={languages}
          selectedLanguage={langB}
          onLanguageChange={setLangB}
          inputText={inputB}
          onInputChange={setInputB}
          translatedText={translatedB}
          isRecording={recordingState === 'listening' && activeSpeaker === 'B'}
          onStartRecording={() => handleStartRecording('B')}
          onStopRecording={handleStopRecording}
          onTranslate={() => executeTranslationPipeline('B', inputB, langB, langA)}
          onPlayAudio={() => handlePlayAudio(translatedB, langA)}
          isPlayingAudio={isPlayingAudio && activeSpeaker === 'B'}
          isTranslating={recordingState === 'translating'}
          isActive={activeSpeaker === 'B'}
        />
      </div>

      {/* Live Conversation Stream */}
      <ConversationView
        conversation={conversation}
        onPlayBubbleAudio={handlePlayAudio}
        onClearConversation={handleClearConversation}
        languages={languages}
      />

      {/* Phrasebook */}
      <Phrasebook onSelectPhrase={handleSelectPhrase} />
    </div>
  );
}
