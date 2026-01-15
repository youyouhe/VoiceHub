import React, { useState } from 'react';
import { Save, Server, Key, Cpu, RotateCcw, Languages, Sliders } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { AVAILABLE_MODELS, TTS_LANGUAGES, CHINESE_DIALECTS } from '../constants';

interface SettingsProps {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  seed: number;
  setSeed: (seed: number) => void;
  ttsLanguage: string;
  setTtsLanguage: (lang: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  backendUrl, 
  setBackendUrl, 
  selectedModel, 
  setSelectedModel,
  seed,
  setSeed,
  ttsLanguage,
  setTtsLanguage
}) => {
  const { t } = useI18n();
  const [token, setToken] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would verify connection or save to localStorage
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="p-6 h-full overflow-y-auto max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('settings.description')}</p>
      </div>

      <div className="space-y-6">
        {/* Backend Configuration Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
             <Server className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
             <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('settings.ttsConfig')}</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backend URL */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block">{t('settings.backendUrl')}</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                            placeholder={t('settings.backendUrlPlaceholder')}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-4 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        />
                    </div>
                </div>

                {/* API Token */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block">{t('settings.apiToken')}</label>
                    <div className="relative">
                         <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                             <Key className="w-4 h-4" />
                         </div>
                        <input 
                            type="password" 
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder={t('settings.apiTokenPlaceholder')}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    {t('settings.inferenceModel')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AVAILABLE_MODELS.map((model) => (
                        <button
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                selectedModel === model
                                ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-white'
                                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                selectedModel === model ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-400 dark:border-gray-500'
                            }`}>
                                {selectedModel === model && <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />}
                            </div>
                            <span className="text-sm font-mono">{model}</span>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* Generation Parameters Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
             <Sliders className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
             <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('settings.genParams')}</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Language Selection */}
               <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        {t('settings.targetLang')}
                    </label>
                    <select
                        value={ttsLanguage}
                        onChange={(e) => setTtsLanguage(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                    >
                        <optgroup label={t('settings.commonLangs')}>
                            {TTS_LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label={t('settings.dialects')}>
                            {CHINESE_DIALECTS.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </optgroup>
                    </select>
               </div>

               {/* Seed Input */}
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      {t('settings.seed')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value))}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button 
                        onClick={() => setSeed(Math.floor(Math.random() * 999999))} 
                        className="p-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors border border-gray-300 dark:border-gray-600"
                        title="Randomize"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
               </div>

            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
               <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 shadow-md"
               >
                   <Save className="w-4 h-4" />
                   {showSaved ? t('settings.saved') : t('settings.save')}
               </button>
          </div>
        </div>

      </div>
    </div>
  );
};
