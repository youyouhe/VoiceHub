import React, { useState, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Settings, Upload, FileAudio } from 'lucide-react';
import { SpeakerItem, PresetVoice } from '../types';
import { TTS_LANGUAGES } from '../constants';
import { useI18n } from '../i18n/I18nContext';
import { fileToBase64, validateAudioFile } from '../src/utils/audio';

interface PresetVoiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  speaker: SpeakerItem | null;
  onSave: (id: string, language: string, promptText: string, audioBase64?: string) => void;
}

export const PresetVoiceEditorModal: React.FC<PresetVoiceEditorModalProps> = ({
  isOpen,
  onClose,
  speaker,
  onSave
}) => {
  const { t } = useI18n();

  const [language, setLanguage] = useState(speaker?.language || 'en');
  const [promptText, setPromptText] = useState(speaker?.promptText || '');
  const [audioFile, setAudioFile] = useState<{ base64: string; fileName: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid audio file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const base64 = await fileToBase64(file);
      setAudioFile({ base64, fileName: file.name });
    } catch (err) {
      setUploadError('Failed to read audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!speaker) return;

    if (!promptText.trim()) {
      setError('Please enter the prompt text');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      onSave(speaker.id, language, promptText.trim(), audioFile?.base64);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !speaker) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-850">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            {t('speaker.editPreset')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {speaker.imageUrl ? (
              <img src={speaker.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />
            ) : (
              <div className="w-12 h-12 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">{speaker.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{speaker.author}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Reference Audio (WAV/MP3)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                uploadError
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : audioFile
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {audioFile ? (
                <>
                  <FileAudio className={`w-8 h-8 ${uploadError ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{audioFile.fileName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAudio();
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </>
              ) : isUploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Reading file...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Click to upload audio</span>
                  <span className="text-xs text-gray-400">WAV or MP3 format</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mp3,audio/mpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Prompt Text
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter the reference text for this voice..."
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
            {t('speaker.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('speaker.saveChanges')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
