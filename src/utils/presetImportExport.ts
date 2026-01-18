import { storage } from './storage';

export async function exportPresetVoices(): Promise<string> {
  const configs = await storage.getAllPresetVoices();
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    voices: Object.entries(configs).map(([id, config]) => ({
      id,
      language: config.language,
      promptText: config.promptText,
      audioBase64: config.audioBase64 || undefined
    }))
  };
  return JSON.stringify(exportData, null, 2);
}

export async function importPresetVoices(jsonString: string): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  try {
    const data = JSON.parse(jsonString);

    if (!data.voices || !Array.isArray(data.voices)) {
      return { success: false, imported: 0, errors: ['Invalid format: voices array not found'] };
    }

    for (const voice of data.voices) {
      try {
        if (!voice.id) {
          errors.push('Voice missing id');
          continue;
        }

        await storage.savePresetVoice(voice.id, {
          language: voice.language || 'en',
          promptText: voice.promptText || '',
          audioBase64: voice.audioBase64
        });
        imported++;
      } catch (err) {
        errors.push(`Failed to import voice ${voice.id}: ${err}`);
      }
    }

    return { success: errors.length === 0, imported, errors };
  } catch (err) {
    return { success: false, imported: 0, errors: [`Parse error: ${err}`] };
  }
}

export function downloadPresetVoices(jsonString: string, filename: string = 'voicecraft-presets.json'): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createDownloadLink(): void {
  const jsonString = `{
  "version": "1.0.0",
  "voices": [
    {
      "id": "1",
      "language": "en",
      "promptText": "Welcome to the neon-lit streets of a dystopian future."
    },
    {
      "id": "2", 
      "language": "jp",
      "promptText": "こんにちは！今日もいい天気ですね。"
    },
    {
      "id": "3",
      "language": "en",
      "promptText": "Good evening, dear listeners. Welcome to our late night radio show."
    },
    {
      "id": "4",
      "language": "en",
      "promptText": "By the beard of my ancestors! This is a mighty adventure!"
    },
    {
      "id": "5",
      "language": "en", 
      "promptText": "Breaking news from around the world. Here is your morning briefing."
    }
  ]
}`;
  downloadPresetVoices(jsonString, 'voicecraft-default-presets.json');
}
