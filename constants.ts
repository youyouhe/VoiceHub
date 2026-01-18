import { PresetVoice } from './types';

export const MOCK_VOICES: PresetVoice[] = [
  {
    id: '1',
    title: 'Cyberpunk Narrator',
    author: 'Neo_001',
    description: 'Deep, gritty male voice perfect for sci-fi narration.',
    tags: ['Sci-Fi', 'Narration', 'Deep'],
    category: 'Narrator',
    duration: '00:12',
    likes: 1240,
    downloads: 500,
    imageUrl: 'https://picsum.photos/200/200?random=1',
    language: 'en',
    promptText: 'Welcome to the neon-lit streets of a dystopian future.',
    presetAudioPath: '/preset-voices/cyberpunk-narrator.wav'
  },
  {
    id: '2',
    title: 'Soothing Anime Girl',
    author: 'Sakura_Dev',
    description: 'Soft, high-pitched voice for anime-style dialogue.',
    tags: ['Anime', 'Female', 'Soft'],
    category: 'Anime',
    duration: '00:08',
    likes: 3400,
    downloads: 2100,
    imageUrl: 'https://picsum.photos/200/200?random=2',
    language: 'jp',
    promptText: 'こんにちは！今日もいい天気ですね。',
    presetAudioPath: '/preset-voices/anime-girl.wav'
  },
  {
    id: '3',
    title: 'Late Night FM Host',
    author: 'JazzVibes',
    description: 'Smooth, calm, and professional radio host voice.',
    tags: ['Radio', 'Male', 'Calm'],
    category: 'Radio',
    duration: '00:15',
    likes: 890,
    downloads: 320,
    imageUrl: 'https://picsum.photos/200/200?random=3',
    language: 'en',
    promptText: 'Good evening, dear listeners. Welcome to our late night radio show.',
    presetAudioPath: '/preset-voices/fm-host.wav'
  },
  {
    id: '4',
    title: 'Fantasy Dwarf',
    author: 'RPG_Master',
    description: 'Rough, Scottish-accented voice for fantasy games.',
    tags: ['Game', 'Fantasy', 'Accent'],
    category: 'Game',
    duration: '00:06',
    likes: 560,
    downloads: 120,
    imageUrl: 'https://picsum.photos/200/200?random=4',
    language: 'en',
    promptText: 'By the beard of my ancestors! This is a mighty adventure!',
    presetAudioPath: '/preset-voices/fantasy-dwarf.wav'
  },
  {
    id: '5',
    title: 'News Anchor',
    author: 'DailyBrief',
    description: 'Neutral, clear, and fast-paced standard American accent.',
    tags: ['News', 'Professional', 'Neutral'],
    category: 'News',
    duration: '00:10',
    likes: 1100,
    downloads: 800,
    imageUrl: 'https://picsum.photos/200/200?random=5',
    language: 'en',
    promptText: 'Breaking news from around the world. Here is your morning briefing.',
    presetAudioPath: '/preset-voices/news-anchor.wav'
  }
];

export const TTS_LANGUAGES = [
  { label: 'Chinese (中文)', value: 'zh', supported: true, primary: true },
  { label: 'English', value: 'en', supported: true, primary: true },
  { label: 'Japanese (日本語)', value: 'jp', supported: true, primary: false },
  { label: 'Korean (한국어)', value: 'ko', supported: true, primary: false },
];

export const CHINESE_DIALECTS: { label: string; value: string }[] = [];
