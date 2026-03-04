import { useCallback, useState } from 'react';
import {
  useAudioRecorder as useExpoRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';

export type RecordingState = 'idle' | 'recording' | 'stopped';

export type UseAudioRecorderReturn = {
  recordingState: RecordingState;
  /** Elapsed recording time in seconds */
  elapsedSeconds: number;
  audioUri: string | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  resetRecording: () => void;
};

/**
 * Encapsulates expo-audio recording lifecycle.
 * Uses expo-audio (SDK 54+) — replaces deprecated expo-av.
 * The underlying recorder is auto-released when the component unmounts.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  // expo-audio manages the recorder lifecycle (creates + cleans up on unmount)
  const recorder = useExpoRecorder(RecordingPresets.HIGH_QUALITY);
  // Poll at 200ms for a responsive timer display
  const recorderState = useAudioRecorderState(recorder, 200);

  const [phase, setPhase] = useState<RecordingState>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('마이크 접근 권한이 필요합니다. 설정에서 허용해 주세요.');
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('녹음을 시작할 수 없습니다.'));
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (uri) {
        setAudioUri(uri);
        setPhase('stopped');
        return uri;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('녹음 저장에 실패했습니다.'));
      return null;
    }
  }, [recorder]);

  const resetRecording = useCallback(() => {
    setPhase('idle');
    setAudioUri(null);
    setError(null);
  }, []);

  return {
    recordingState: phase,
    // durationMillis comes from expo-audio's live state
    elapsedSeconds: Math.floor((recorderState.durationMillis ?? 0) / 1000),
    audioUri,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
