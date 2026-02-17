import { useCallback, useRef } from 'react';

/**
 * Exposes `speak(text)` and `stop()` using the native
 * Web Speech API (SpeechSynthesis).
 */
export function useTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, lang = 'es-ES') => {
    if (!window.speechSynthesis) {
      console.warn('[TTS] SpeechSynthesis not supported');
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  const isSpeaking = useCallback(() => {
    return window.speechSynthesis?.speaking ?? false;
  }, []);

  return { speak, stop, isSpeaking };
}
