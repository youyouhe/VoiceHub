import { VoiceModel } from './types';

export const MOCK_VOICES: VoiceModel[] = [
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
    imageUrl: 'https://picsum.photos/200/200?random=1'
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
    imageUrl: 'https://picsum.photos/200/200?random=2'
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
    imageUrl: 'https://picsum.photos/200/200?random=3'
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
    imageUrl: 'https://picsum.photos/200/200?random=4'
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
    imageUrl: 'https://picsum.photos/200/200?random=5'
  }
];

export const AVAILABLE_MODELS = [
  'CosyVoice-300M-SFT (Default)',
  'CosyVoice-300M-Instruct',
  'GPT-SoVITS-v2 (Plugin)'
];

export const TTS_LANGUAGES = [
  { label: 'Chinese (中文)', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: 'Japanese (日本語)', value: 'jp' },
  { label: 'Korean (한국어)', value: 'ko' },
  { label: 'German (Deutsch)', value: 'de' },
  { label: 'Spanish (Español)', value: 'es' },
  { label: 'French (Français)', value: 'fr' },
  { label: 'Italian (Italiano)', value: 'it' },
  { label: 'Russian (Русский)', value: 'ru' },
];

export const CHINESE_DIALECTS = [
    { label: 'Guangdong (Yue)', value: 'yue' },
    { label: 'Minnan', value: 'mn' },
    { label: 'Sichuan', value: 'sichuan' },
    { label: 'Dongbei', value: 'dongbei' },
    { label: 'Shan3xi (Shaanxi)', value: 'shan3xi' },
    { label: 'Shan1xi (Shanxi)', value: 'shan1xi' },
    { label: 'Shanghai', value: 'shanghai' },
    { label: 'Tianjin', value: 'tianjin' },
    { label: 'Shandong', value: 'shandong' },
    { label: 'Ningxia', value: 'ningxia' },
    { label: 'Gansu', value: 'gansu' },
];
