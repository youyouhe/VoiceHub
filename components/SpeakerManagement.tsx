import React, { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { SpeakerItem, PresetVoice } from '../types';
import { MOCK_VOICES, TTS_LANGUAGES } from '../constants';
import { SpeakerCard } from './SpeakerCard';
import { PresetVoiceEditorModal } from './PresetVoiceEditorModal';
import { useI18n } from '../i18n/I18nContext';
import { useSpeakerManagement } from '../src/hooks/useCosyVoice';
import { storage } from '../src/utils/storage';

interface SpeakerManagementProps {
  backendUrl: string;
  onSelectSpeaker: (speaker: SpeakerItem) => void;
  onCreateSpeaker: () => void;
}

const LANGUAGE_KEY = 'voicehub_speaker_languages';

const LANGUAGE_LABELS: Record<string, string> = {
  'zh': 'Chinese',
  'en': 'English',
  'jp': 'Japanese',
  'ko': 'Korean',
  'de': 'German',
  'es': 'Spanish',
  'fr': 'French',
  'it': 'Italian',
  'ru': 'Russian'
};

export const SpeakerManagement: React.FC<SpeakerManagementProps> = ({
  backendUrl,
  onSelectSpeaker,
  onCreateSpeaker
}) => {
  const { t } = useI18n();
  const { speakers, isLoading, error, fetchSpeakers, deleteSpeaker } = useSpeakerManagement(backendUrl);
  const [speakersList, setSpeakersList] = useState<string[]>([]);
  const [editingPreset, setEditingPreset] = useState<SpeakerItem | null>(null);
  const [presetConfigs, setPresetConfigs] = useState<Record<string, { language: string; promptText: string; audioBase64?: string }>>({});
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);

  const getSpeakerLanguages = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem(LANGUAGE_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const [speakerLanguages, setSpeakerLanguages] = useState<Record<string, string>>(() => getSpeakerLanguages());

  useEffect(() => {
    const loadConfigs = async () => {
      setIsLoadingConfigs(true);
      try {
        const configs = await storage.getAllPresetVoices();
        setPresetConfigs(configs);
      } catch (err) {
        console.error('Failed to load preset configs:', err);
      } finally {
        setIsLoadingConfigs(false);
      }
    };
    loadConfigs();
  }, []);

  useEffect(() => {
    fetchSpeakers().then(setSpeakersList);
  }, [backendUrl]);

  useEffect(() => {
    const languages = getSpeakerLanguages();
    setSpeakerLanguages(languages);
    fetchSpeakers().then(setSpeakersList);
  }, []);

  const presetSpeakers: SpeakerItem[] = MOCK_VOICES.map((voice: PresetVoice): SpeakerItem => {
    const config = presetConfigs[voice.id] || {};
    const localizedTitle = t(`voices.${voice.id}.title`);
    const isConfigured = !!config.audioBase64;
    return {
      id: voice.id,
      title: localizedTitle && localizedTitle !== `voices.${voice.id}.title` ? localizedTitle : voice.title,
      description: voice.description,
      source: 'preset' as const,
      author: voice.author,
      category: voice.category,
      imageUrl: voice.imageUrl,
      hasAudio: isConfigured,
      language: config.language || voice.language || 'en',
      promptText: config.promptText || voice.promptText || ''
    };
  });

  const customSpeakers: SpeakerItem[] = speakersList.map((id): SpeakerItem => ({
    id,
    title: id,
    description: undefined,
    source: 'custom' as const,
    hasAudio: true,
    language: speakerLanguages[id] || 'zh'
  }));

  const handleDelete = async (id: string) => {
    const success = await deleteSpeaker(id);
    if (success) {
      setSpeakersList(prev => prev.filter(s => s !== id));
      const languages = getSpeakerLanguages();
      delete languages[id];
      localStorage.setItem(LANGUAGE_KEY, JSON.stringify(languages));
      setSpeakerLanguages(languages);
    }
  };

  const handleEditPreset = (speaker: SpeakerItem) => {
    setEditingPreset(speaker);
  };

  const handleSavePreset = async (id: string, language: string, promptText: string, audioBase64?: string) => {
    await storage.savePresetVoice(id, { language, promptText, audioBase64 });

    const newConfigs = { ...presetConfigs, [id]: { language, promptText, audioBase64 } };
    setPresetConfigs(newConfigs);

    const newLanguages = { ...speakerLanguages, [id]: language };
    setSpeakerLanguages(newLanguages);
    localStorage.setItem(LANGUAGE_KEY, JSON.stringify(newLanguages));
  };

  const handleSelectSpeaker = (speaker: SpeakerItem) => {
    if (speaker.source === 'preset') {
      const config = presetConfigs[speaker.id] || {};
      const updatedSpeaker = {
        ...speaker,
        language: config.language || speaker.language,
        promptText: config.promptText || speaker.promptText
      };
      onSelectSpeaker(updatedSpeaker);
    } else {
      onSelectSpeaker(speaker);
    }
  };

  const groupedCustomSpeakers = customSpeakers.reduce((acc, speaker) => {
    const lang = speaker.language || 'unknown';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(speaker);
    return acc;
  }, {} as Record<string, SpeakerItem[]>);

  const renderSpeakerGroup = (title: string, speakers: SpeakerItem[]) => (
    <div className="mb-6">
      {title && (
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">{title}</h4>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {speakers.map((speaker) => (
          <SpeakerCard
            key={speaker.id}
            speaker={speaker}
            onClick={() => handleSelectSpeaker(speaker)}
            onEdit={speaker.source === 'preset' ? () => handleEditPreset(speaker) : undefined}
            onDelete={speaker.source === 'custom' ? () => handleDelete(speaker.id) : undefined}
          />
        ))}
      </div>
    </div>
  );

  if (isLoadingConfigs) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('speaker.management')}</h3>
        </div>
        <button
          onClick={onCreateSpeaker}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('speaker.create')}
        </button>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {t('speaker.fetchError')}: {error}
          </div>
        )}

        {presetSpeakers.length > 0 && renderSpeakerGroup('Preset Voices', presetSpeakers)}

        {Object.keys(groupedCustomSpeakers).length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Custom Speakers</h4>
            {Object.entries(groupedCustomSpeakers).map(([lang, speakers]) =>
              <div key={lang}>
                {renderSpeakerGroup(LANGUAGE_LABELS[lang] || lang, speakers)}
              </div>
            )}
          </div>
        )}

        {customSpeakers.length === 0 && presetSpeakers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('speaker.noSpeakers')}</p>
          </div>
        )}
      </div>

      <PresetVoiceEditorModal
        isOpen={!!editingPreset}
        onClose={() => setEditingPreset(null)}
        speaker={editingPreset}
        onSave={handleSavePreset}
      />
    </div>
  );
};
