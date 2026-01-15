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
  previewAudioUrl?: string; // Optional for mock
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
