# Preset Voices for VoiceCraft CE

This directory contains preset voice configurations for VoiceCraft Community Edition.

## Directory Structure

```
preset-voices/
├── cyberpunk-narrator.wav   # Cyberpunk Narrator (English)
├── anime-girl.wav           # Soothing Anime Girl (Japanese)
├── fm-host.wav              # Late Night FM Host (English)
├── fantasy-dwarf.wav        # Fantasy Dwarf (English)
└── news-anchor.wav          # News Anchor (English)
```

## Usage

### Option 1: Import via Settings
1. Go to Settings → Speakers
2. Click "Import" button
3. Select the `preset-voices-default.json` file
4. Configure each preset voice by clicking the edit icon

### Option 2: Copy Audio Files
1. Copy `.wav` files to `public/preset-voices/` directory
2. Update `constants.ts` with the correct paths

## Adding Custom Preset Voices

1. Record a reference audio (WAV format, 10-20 seconds)
2. Create the reference text (what's spoken in the audio)
3. Update `constants.ts`:
```typescript
{
  id: '6',
  title: 'My Custom Voice',
  author: 'YourName',
  description: 'Description of the voice',
  language: 'en',
  promptText: 'The text spoken in the reference audio',
  presetAudioPath: '/preset-voices/my-custom-voice.wav'
}
```

4. Add i18n translations in `i18n/translations.ts`

## API Reference

### PresetVoice Interface
```typescript
interface PresetVoice {
  id: string;              // Unique identifier
  title: string;           // Display name
  author: string;          // Creator name
  description: string;     // Voice description
  tags: string[];          // Search tags
  category: string;        // Voice category
  duration?: string;       // Duration string (e.g., "00:12")
  likes?: number;          // Like count
  downloads?: number;      // Download count
  imageUrl?: string;       // Cover image URL
  language?: string;       // Language code (en, zh, jp, etc.)
  promptText?: string;     // Reference text
  presetAudioPath?: string; // Path to audio file in public folder
}
```

## Notes

- Audio files should be WAV format, 16kHz sample rate recommended
- Reference audio should be 10-20 seconds of clear speech
- Each preset can be configured with custom audio via Settings
