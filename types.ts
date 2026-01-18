export interface SystemMetrics {
  gpuName: string;
  vramUsed: number;
  vramTotal: number;
  temperature: number;
  backendStatus: 'online' | 'offline' | 'busy';
  latency: number;
}

export interface VoiceModel {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  category: 'Anime' | 'Game' | 'News' | 'Narrator' | 'Real' | 'Radio' | 'Other';
  duration: string;
  likes: number;
  downloads: number;
  imageUrl: string;
  previewAudioUrl?: string;
  presetAudioPath?: string;
  promptText?: string;
  language?: string;
}

export interface GenerationParams {
  text: string;
  voiceId: string;
  seed: number;
  model: string;
}

export interface GenerationResult {
  id: string;
  timestamp: number;
  text: string;
  audioUrl: string; // Blob URL in real app
  duration: number;
  isPublished?: boolean;
}

export interface PublishedWork {
  id: string;
  title: string;
  description: string;
  author: string; // "You" or others
  audioUrl: string;
  duration: number;
  visibility: 'public' | 'private';
  likes: number;
  timestamp: number;
  coverColor: string; // For audiobook UI visualization
}

export enum ViewState {
  WORKSPACE = 'WORKSPACE',
  GALLERY = 'GALLERY',
  SETTINGS = 'SETTINGS'
}

export type Language = 'en' | 'zh';

export type CosyVoiceMode = 'zero_shot' | 'cross_lingual' | 'instruct2';

export interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  modelLoaded: boolean;
  modelVersion?: string;
  modelName?: string;
  speakersCount: number;
  availableModes: CosyVoiceMode[];
  uptimeSeconds?: number;
  error?: string;
}

export interface TTSRequest {
  text: string;
  mode: CosyVoiceMode;
  speed?: number;
  seed?: number;
  promptText?: string;
  promptAudio?: string;
  speakerId?: string;
  instructText?: string;
}

export interface TTSResult {
  success: boolean;
  audioData: string;
  sampleRate: number;
  duration: number;
  mode: CosyVoiceMode;
}

export interface Speaker {
  id: string;
  promptText: string;
  audioBase64?: string;
  createdAt?: number;
}

export interface LocalVoiceReference {
  id: string;
  title: string;
  description?: string;
  audioBase64: string;
  promptText: string;
  category?: string;
  author?: string;
}

export interface PresetVoice {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  category: string;
  imageUrl: string;
  duration?: string;
  likes?: number;
  downloads?: number;
  presetAudioPath?: string;
  language?: string;
  promptText?: string;
}

export interface CustomSpeaker {
  id: string;
  promptText: string;
  createdAt: number;
}

export interface SpeakerItem {
  id: string;
  title: string;
  description?: string;
  source: 'preset' | 'custom';
  author?: string;
  category?: string;
  imageUrl?: string;
  hasAudio: boolean;
  language?: string;
  promptText?: string;
}

export interface SystemMetricsResponse {
  cpu: {
    usage_percent: number;
    cores: number;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    usage_percent: number;
  };
  gpu: {
    available: boolean;
    name?: string;
    driver_version?: string;
    cuda_version?: string | null;
    vram_total_mb?: number;
    vram_used_mb?: number;
    vram_free_mb?: number;
    gpu_utilization_percent?: number;
    temperature_celsius?: number;
    power_draw_watts?: number;
    error?: string | null;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    usage_percent: number;
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
  };
  timestamp: string;
}
