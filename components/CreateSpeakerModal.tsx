import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useSpeakerManagement } from '../src/hooks/useCosyVoice';
import { fileToBase64, validateAudioFile } from '../src/utils/audio';
import { TTS_LANGUAGES } from '../constants';

interface CreateSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  existingSpeakers: string[];
  onSuccess: (speakerId: string, language: string) => void;
}

export const CreateSpeakerModal: React.FC<CreateSpeakerModalProps> = ({
  isOpen,
  onClose,
  backendUrl,
  existingSpeakers,
  onSuccess
}) => {
  const { t } = useI18n();
  const [speakerId, setSpeakerId] = useState('');
  const [promptText, setPromptText] = useState('');
  const [language, setLanguage] = useState('zh');
  const [audioFile, setAudioFile] = useState<{ base64: string; fileName: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createSpeaker } = useSpeakerManagement(backendUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid audio file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      setAudioFile({ base64, fileName: file.name });
    } catch (err) {
      setError('Failed to read audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    const trimmedId = speakerId.trim();
    
    if (!trimmedId) {
      setCreateError('Please enter a speaker ID');
      return;
    }
    
    if (existingSpeakers.includes(trimmedId)) {
      setCreateError(`Speaker '${trimmedId}' already exists`);
      return;
    }
    
    if (!audioFile) {
      setCreateError('Please upload a reference audio');
      return;
    }
    if (!promptText.trim()) {
      setCreateError('Please enter the prompt text');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const success = await createSpeaker(trimmedId, promptText.trim(), audioFile.base64, language);
      if (success) {
        onSuccess(trimmedId, language);
        onClose();
        setSpeakerId('');
        setPromptText('');
        setLanguage('zh');
        setAudioFile(null);
      } else {
        setCreateError('Failed to create speaker');
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create speaker');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-850">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            {t('speaker.create')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {createError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Speaker ID
            </label>
            <input 
              type="text"
              value={speakerId}
              onChange={(e) => {
                setSpeakerId(e.target.value);
                if (existingSpeakers.includes(e.target.value.trim())) {
                  setIdError('This speaker ID already exists');
                } else {
                  setIdError(null);
                }
              }}
              placeholder="my_custom_voice"
              className={`w-full bg-white dark:bg-gray-800 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${
                idError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {idError && <p className="text-xs text-red-500">{idError}</p>}
            <p className="text-xs text-gray-500">Unique identifier for this speaker</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
            >
              {TTS_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Language of the reference audio</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Reference Audio
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              {audioFile ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{audioFile.fileName}</span>
                  <span className="text-xs text-gray-400">Click to change</span>
                </>
              ) : isUploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Reading file...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium">{t('workspace.uploadRefAudio')}</span>
                  <span className="text-xs text-gray-400">{t('workspace.support')}</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mp3"
              onChange={handleFileSelect}
              className="hidden"
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Prompt Text
            </label>
            <textarea 
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={t('workspace.referenceTextPlaceholder')}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 text-sm"
            />
            <p className="text-xs text-gray-500">The text content of the reference audio</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-850 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {t('workspace.publishModal.cancel')}
          </button>
          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('speaker.create')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
