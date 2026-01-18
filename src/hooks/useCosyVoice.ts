import { useState, useCallback, useRef, useEffect } from 'react';
import { CosyVoiceService } from '../services/cosyvoice';
import { ServiceStatus, TTSRequest, TTSResult, Speaker, SystemMetricsResponse } from '../../types';
import { base64ToBlobUrl, fileToBase64 } from '../utils/audio';

export function useCosyVoice(baseUrl: string = 'http://localhost:9880') {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<CosyVoiceService | null>(null);

  useEffect(() => {
    if (baseUrl && baseUrl.trim()) {
      serviceRef.current = new CosyVoiceService(baseUrl);
    } else {
      serviceRef.current = null;
    }
  }, [baseUrl]);

  const updateBaseUrl = useCallback((url: string) => {
    if (serviceRef.current) {
      serviceRef.current.setBaseUrl(url);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<ServiceStatus> => {
    if (!serviceRef.current) {
      const failedStatus: ServiceStatus = {
        status: 'unhealthy',
        modelLoaded: false,
        modelVersion: undefined,
        modelName: undefined,
        speakersCount: 0,
        availableModes: [],
        error: 'Backend URL not configured'
      };
      setStatus(failedStatus);
      setError('Backend URL not configured');
      return failedStatus;
    }

    try {
      setIsLoading(true);
      const result = await serviceRef.current.healthCheck();
      setStatus(result);
      setError(result.error || null);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Health check failed';
      const failedStatus: ServiceStatus = {
        status: 'unhealthy',
        modelLoaded: false,
        modelVersion: undefined,
        modelName: undefined,
        speakersCount: 0,
        availableModes: [],
        error: errorMsg
      };
      setStatus(failedStatus);
      setError(errorMsg);
      return failedStatus;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    service: serviceRef.current,
    status,
    isLoading,
    error,
    updateBaseUrl,
    checkHealth
  };
}

export function useSystemMetrics(baseUrl: string = 'http://localhost:9880') {
  const [metrics, setMetrics] = useState<SystemMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<CosyVoiceService | null>(null);

  useEffect(() => {
    if (baseUrl && baseUrl.trim()) {
      serviceRef.current = new CosyVoiceService(baseUrl);
    } else {
      serviceRef.current = null;
    }
  }, [baseUrl]);

  const fetchMetrics = useCallback(async (): Promise<SystemMetricsResponse | null> => {
    if (!serviceRef.current) {
      setError('Backend URL not configured');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await serviceRef.current.getSystemMetrics();
      if (result) {
        setMetrics(result);
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics(null);
    setError(null);
  }, []);

  return {
    metrics,
    isLoading,
    error,
    fetchMetrics,
    clearMetrics
  };
}

export function useTTS(baseUrl: string = 'http://localhost:9880') {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TTSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<CosyVoiceService>(new CosyVoiceService(baseUrl));

  const generate = useCallback(async (request: TTSRequest): Promise<TTSResult | null> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(10);
      const response = await serviceRef.current.textToSpeech(request);
      setProgress(90);
      setResult(response);
      setProgress(100);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'TTS generation failed';
      setError(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    reset,
    result,
    isGenerating,
    progress,
    error
  };
}

export function useSpeakerManagement(baseUrl: string = 'http://localhost:9880') {
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<CosyVoiceService>(new CosyVoiceService(baseUrl));

  const fetchSpeakers = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRef.current.listSpeakers();
      setSpeakers(response.speakers);
      return response.speakers;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch speakers';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSpeaker = useCallback(async (
    speakerId: string,
    promptText: string,
    promptAudio: string | File,
    language: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      let audioBase64: string;
      if (promptAudio instanceof File) {
        audioBase64 = await fileToBase64(promptAudio);
      } else {
        audioBase64 = promptAudio;
      }
      
      await serviceRef.current.createSpeaker(speakerId, promptText, audioBase64, language);
      await fetchSpeakers();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create speaker';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpeakers]);

  const deleteSpeaker = useCallback(async (speakerId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await serviceRef.current.deleteSpeaker(speakerId);
      await fetchSpeakers();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete speaker';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpeakers]);

  return {
    speakers,
    isLoading,
    error,
    fetchSpeakers,
    createSpeaker,
    deleteSpeaker
  };
}

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((blobUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(blobUrl);
      audioRef.current = audio;
      
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      audio.play().catch(reject);
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  return { play, stop, pause };
}
