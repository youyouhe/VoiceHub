export interface PresetVoiceConfig {
  id: string;
  language: string;
  promptText: string;
  audioBase64?: string;
  updatedAt: number;
}

export interface DefaultPresetConfig {
  version: string;
  voices: {
    id: string;
    language: string;
    promptText: string;
    audioBase64?: string;
  }[];
}

export const DEFAULT_PRESETS_JSON = JSON.stringify({
  version: '1.0.0',
  voices: [
    {
      id: '1',
      language: 'en',
      promptText: 'Welcome to the neon-lit streets of a dystopian future.',
      audioBase64: ''
    },
    {
      id: '2',
      language: 'jp',
      promptText: 'こんにちは！今日もいい天気ですね。',
      audioBase64: ''
    },
    {
      id: '3',
      language: 'en',
      promptText: 'Good evening, dear listeners. Welcome to our late night radio show.',
      audioBase64: ''
    },
    {
      id: '4',
      language: 'en',
      promptText: 'By the beard of my ancestors! This is a mighty adventure!',
      audioBase64: ''
    },
    {
      id: '5',
      language: 'en',
      promptText: 'Breaking news from around the world. Here is your morning briefing.',
      audioBase64: ''
    }
  ]
}, null, 2);
