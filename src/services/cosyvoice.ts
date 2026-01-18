import { TTSRequest, TTSResult, ServiceStatus, Speaker, SystemMetricsResponse } from '../../types';

const DEFAULT_BASE_URL = 'http://localhost:9880';

export class CosyVoiceService {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async healthCheck(): Promise<ServiceStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        modelLoaded: data.model_loaded,
        modelVersion: data.model_version,
        modelName: data.model_name,
        speakersCount: data.speakers_count,
        availableModes: data.available_modes || [],
        uptimeSeconds: data.uptime_seconds,
        error: undefined
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        modelLoaded: false,
        modelVersion: undefined,
        modelName: undefined,
        speakersCount: 0,
        availableModes: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getSystemMetrics(): Promise<SystemMetricsResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/system/metrics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format: expected JSON');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch system metrics:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  async listSpeakers(): Promise<{ speakers: string[]; mode: string }> {
    const response = await fetch(`${this.baseUrl}/speakers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to list speakers' }));
      throw new Error(error.detail || 'Failed to list speakers');
    }

    return response.json();
  }

  async createSpeaker(speakerId: string, promptText: string, promptAudio: string, language: string): Promise<{ success: boolean; speaker_id: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/speakers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speaker_id: speakerId,
        prompt_text: promptText,
        prompt_audio: promptAudio,
        language
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create speaker' }));
      throw new Error(error.detail || 'Failed to create speaker');
    }

    return response.json();
  }

  async deleteSpeaker(speakerId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/speakers/${encodeURIComponent(speakerId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete speaker' }));
      throw new Error(error.detail || 'Failed to delete speaker');
    }

    return response.json();
  }

  async textToSpeech(request: TTSRequest): Promise<TTSResult> {
    const payload: Record<string, unknown> = {
      mode: request.mode,
      text: request.text,
      speed: request.speed ?? 1.0,
      seed: request.seed
    };

    switch (request.mode) {
      case 'zero_shot':
        if (request.speakerId) {
          payload.speaker_id = request.speakerId;
        } else {
          payload.prompt_text = request.promptText;
          payload.prompt_audio = request.promptAudio;
        }
        break;
      case 'cross_lingual':
        payload.prompt_audio = request.promptAudio;
        break;
      case 'instruct2':
        payload.speaker_id = request.speakerId;
        payload.instruct_text = request.instructText;
        break;
    }

    const response = await fetch(`${this.baseUrl}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'TTS generation failed' }));
      throw new Error(error.detail || 'TTS generation failed');
    }

    const data = await response.json();
    return {
      success: true,
      audioData: data.audio_data,
      sampleRate: data.sample_rate || 24000,
      duration: data.duration,
      mode: data.mode || request.mode
    };
  }
}

export const cosyvoiceService = new CosyVoiceService();
