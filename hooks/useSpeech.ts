import { useSpeechContext } from "@/contexts/SpeechContext";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";

export type SpeechState = "idle" | "speaking" | "done";

type UseSpeechReturn = {
  speechState: SpeechState;
  isSpeaking: boolean;
  isKoreanAvailable: boolean;
  isVoiceCheckComplete: boolean;
  speak: (text: string, onDone?: () => void) => void;
  stop: () => void;
  replay: (text: string, onDone?: () => void) => void;
};

/**
 * Per-component TTS hook.
 * Voice detection runs once in SpeechProvider (app root) and is shared via context.
 * Each call to useSpeech() owns its own isSpeaking state — Speech.stop() is global
 * so only one component can be speaking at a time.
 */
export function useSpeech(): UseSpeechReturn {
  const { isKoreanAvailable, isVoiceCheckComplete, koreanVoiceId } =
    useSpeechContext();
  const [speechState, setSpeechState] = useState<SpeechState>("idle");

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      Speech.stop();
      setSpeechState("speaking");
      Speech.speak(text, {
        ...(koreanVoiceId ? { voice: koreanVoiceId } : { language: "ko" }),
        rate: 1.5,
        pitch: 1.0,
        onDone: () => {
          setSpeechState("done");
          onDone?.();
        },
        onError: () => {
          setSpeechState("done");
          onDone?.();
        },
      });
    },
    [koreanVoiceId],
  );

  const stop = useCallback(() => {
    Speech.stop();
    setSpeechState("idle");
  }, []);

  const replay = useCallback(
    (text: string, onDone?: () => void) => {
      speak(text, onDone);
    },
    [speak],
  );

  return {
    speechState,
    isSpeaking: speechState === "speaking",
    isKoreanAvailable,
    isVoiceCheckComplete,
    speak,
    stop,
    replay,
  };
}
