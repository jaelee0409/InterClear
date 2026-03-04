import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

type SpeechContextValue = {
  isKoreanAvailable: boolean;
  isVoiceCheckComplete: boolean;
  koreanVoiceId: string | undefined;
};

const SpeechContext = createContext<SpeechContextValue>({
  isKoreanAvailable: false,
  isVoiceCheckComplete: false,
  koreanVoiceId: undefined,
});

/** Mounts once at the app root — runs voice detection a single time for all consumers. */
export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [isKoreanAvailable, setIsKoreanAvailable] = useState(false);
  const [isVoiceCheckComplete, setIsVoiceCheckComplete] = useState(false);
  const [koreanVoiceId, setKoreanVoiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((voices) => {
      const korean = voices.find(
        (v) => v.language.startsWith('ko') || v.identifier.toLowerCase().includes('ko'),
      );
      if (korean) {
        setKoreanVoiceId(korean.identifier);
        setIsKoreanAvailable(true);
      }
      setIsVoiceCheckComplete(true);
    });
  }, []);

  return (
    <SpeechContext.Provider value={{ isKoreanAvailable, isVoiceCheckComplete, koreanVoiceId }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeechContext() {
  return useContext(SpeechContext);
}
