import React from 'react';
import { X, CheckCircle, AlertCircle, User, Settings } from 'lucide-react';
import { SpeakerItem } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface SpeakerCardProps {
  speaker: SpeakerItem;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, onClick, onEdit, onDelete }) => {
  const { t } = useI18n();
  const isPreset = speaker.source === 'preset';
  const isReady = speaker.hasAudio;

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all cursor-pointer group ${
        isPreset
          ? isReady
            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-500'
            : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-500'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {speaker.imageUrl ? (
          <img src={speaker.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />
        ) : (
          <div className={`w-10 h-10 rounded flex items-center justify-center ${
            isPreset
              ? isReady
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-orange-100 dark:bg-orange-900/30'
              : 'bg-indigo-100 dark:bg-indigo-900/30'
          }`}>
            {isReady ? (
              <CheckCircle className={`w-5 h-5 ${isPreset ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {speaker.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {speaker.author || speaker.id}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {isPreset ? (
          isReady ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3 h-3" />
              Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
              <AlertCircle className="w-3 h-3" />
              {t('speaker.needAudio')}
            </span>
          )
        ) : speaker.hasAudio ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            {t('speaker.ready')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-3 h-3" />
            {t('speaker.needAudio')}
          </span>
        )}
        {isPreset && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            isReady
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
          }`}>
            Preset
          </span>
        )}
      </div>

      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            title={t('speaker.edit')}
          >
            <Settings className="w-3 h-3 text-indigo-500" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title={t('speaker.delete')}
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};
