import React, { useState, useEffect, useRef } from 'react';
import { Server, Key, Languages, Sliders, Wifi, WifiOff, CheckCircle2, Cpu, Activity, HardDrive, Users, Download, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { TTS_LANGUAGES, CHINESE_DIALECTS } from '../constants';
import { ServiceStatus, SpeakerItem, SystemMetricsResponse, CosyVoiceMode } from '../types';
import { SpeakerManagement } from './SpeakerManagement';
import { CosyVoiceService } from '../src/services/cosyvoice';
import { exportPresetVoices, importPresetVoices, downloadPresetVoices } from '../src/utils/presetImportExport';
import { storage } from '../src/utils/storage';

interface SettingsProps {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  ttsLanguage: string;
  setTtsLanguage: (lang: string) => void;
  ttsMode: CosyVoiceMode;
  setTtsMode: (mode: CosyVoiceMode) => void;
  onSelectSpeaker: (speaker: SpeakerItem) => void;
  onCreateSpeaker: () => void;
  healthStatus: ServiceStatus | null;
  systemMetrics: SystemMetricsResponse | null;
}

type SettingsTab = 'config' | 'params' | 'speakers';

export const Settings: React.FC<SettingsProps> = ({ 
  backendUrl, 
  setBackendUrl, 
  ttsLanguage,
  setTtsLanguage,
  ttsMode,
  setTtsMode,
  onSelectSpeaker,
  onCreateSpeaker,
  healthStatus,
  systemMetrics
}) => {
  const { t } = useI18n();
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<SettingsTab>('config');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isTesting, setIsTesting] = useState(false);
  const serviceRef = useRef<CosyVoiceService>(new CosyVoiceService(backendUrl));

  // Update service when backendUrl changes
  useEffect(() => {
    serviceRef.current.setBaseUrl(backendUrl);
  }, [backendUrl]);

  // Auto save backendUrl
  useEffect(() => {
    const timer = setTimeout(() => {
      if (backendUrl) {
        localStorage.setItem('voicehub_backend_url', backendUrl);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [backendUrl]);

  // Auto save ttsLanguage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ttsLanguage) {
        localStorage.setItem('voicehub_tts_language', ttsLanguage);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ttsLanguage]);

  // Auto save ttsMode
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ttsMode) {
        localStorage.setItem('voicehub_tts_mode', ttsMode);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ttsMode]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      const result = await serviceRef.current.healthCheck();
      setConnectionStatus(result.status === 'healthy' ? 'success' : 'error');
    } catch (err) {
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const tabs = [
    { id: 'config' as const, label: t('settings.ttsConfig'), icon: Server },
    { id: 'params' as const, label: t('settings.genParams'), icon: Sliders },
    { id: 'speakers' as const, label: t('speaker.management'), icon: Users }
  ];

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('settings.description')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('settings.ttsConfig')}</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block">{t('settings.backendUrl')}</label>
                    <input 
                      type="text" 
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder={t('settings.backendUrlPlaceholder')}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block">{t('settings.apiToken')}</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Key className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={t('settings.apiTokenPlaceholder')}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">API token for authentication (local dev only)</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isTesting
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {t('settings.testing')}
                        </>
                      ) : (
                        <>
                          <Wifi className="w-4 h-4" />
                          {t('settings.testConnection')}
                        </>
                      )}
                    </button>
                    
                    {connectionStatus === 'success' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {t('settings.connectionSuccess')}
                        </span>
                      </div>
                    )}
                    
                    {connectionStatus === 'error' && (
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {t('settings.connectionFailed')}
                        </span>
                      </div>
                    )}
                  </div>

                  {healthStatus?.modelLoaded && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <Cpu className="w-4 h-4" />
                          <span className="text-xs font-medium">{t('settings.modelName')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {healthStatus.modelName || 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs font-medium">{t('settings.modelVersion')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          v{healthStatus.modelVersion || '?'}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <span className="text-xs font-medium">{t('settings.speakers')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {healthStatus.speakersCount}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <span className="text-xs font-medium">{t('settings.modes')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {healthStatus.availableModes?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {systemMetrics && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">{t('settings.systemResources')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                          <Cpu className="w-4 h-4" />
                          <span className="text-xs font-medium">{t('settings.gpu')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {systemMetrics.gpu.name || 'N/A'}
                        </p>
                        {systemMetrics.gpu.vram_total_mb && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>VRAM</span>
                              <span>{Math.round(systemMetrics.gpu.vram_used_mb / 1024)}GB / {Math.round(systemMetrics.gpu.vram_total_mb / 1024)}GB</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${(systemMetrics.gpu.vram_used_mb / systemMetrics.gpu.vram_total_mb) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {systemMetrics.gpu.temperature_celsius && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {systemMetrics.gpu.temperature_celsius}°C
                          </p>
                        )}
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs font-medium">{t('settings.cpu')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {systemMetrics.cpu.cores} Cores
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Usage</span>
                            <span>{systemMetrics.cpu.usage_percent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${systemMetrics.cpu.usage_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                          <span className="text-xs font-medium">{t('settings.memory')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {systemMetrics.memory.total_gb.toFixed(1)}GB
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Used</span>
                            <span>{systemMetrics.memory.used_gb.toFixed(1)}GB</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 transition-all duration-500"
                              style={{ width: `${systemMetrics.memory.usage_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                          <HardDrive className="w-4 h-4" />
                          <span className="text-xs font-medium">{t('settings.disk')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {systemMetrics.disk.total_gb.toFixed(0)}GB
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Used</span>
                            <span>{systemMetrics.disk.usage_percent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${systemMetrics.disk.usage_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'params' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('settings.genParams')}</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <optgroup label="Primary Languages (Best Quality)">
                        {TTS_LANGUAGES.filter(l => l.primary).map((lang) => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Cross-Lingual (Good Quality)">
                        {TTS_LANGUAGES.filter(l => !l.primary).map((lang) => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-gray-500">
                      Primary: Best quality • Cross-Lingual: Synthesizes in target language using reference audio
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 block flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      {t('settings.ttsMode')}
                    </label>
                    <select
                      value={ttsMode}
                      onChange={(e) => setTtsMode(e.target.value as CosyVoiceMode)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                    >
                      <option value="zero_shot">{t('workspace.mode.zeroShot')}</option>
                      <option value="cross_lingual">{t('workspace.mode.crossLingual')}</option>
                      <option value="instruct2">{t('workspace.mode.instruct2')}</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase">CosyVoice 2.0 Supported Languages</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                      ★ Chinese (130K hrs)
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                      ★ English (30K hrs)
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Japanese (Cross-lingual)
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Korean (Cross-lingual)
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    ★ Primary languages: Best quality • Cross-lingual: Synthesizes in target language using reference audio
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'speakers' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">Preset Voice Management</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const json = await exportPresetVoices();
                        downloadPresetVoices(json, 'my-preset-voices.json');
                      } catch (err) {
                        alert('Failed to export: ' + err);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export All
                  </button>
                  <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text();
                        const result = await importPresetVoices(text);
                        if (result.success) {
                          alert(`Imported ${result.imported} preset voices`);
                          window.location.reload();
                        } else {
                          alert('Import failed: ' + result.errors.join(', '));
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to clear all preset voice configurations?')) {
                        try {
                          await storage.clearPresetVoices();
                          alert('Cleared all preset voice configurations');
                          window.location.reload();
                        } catch (err) {
                          alert('Failed to clear: ' + err);
                        }
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Export & Import Preset Voices</p>
                    <p>Export your configured preset voices to a JSON file for backup or sharing. Import the file to restore them on another device.</p>
                  </div>
                </div>
                <SpeakerManagement
                  backendUrl={backendUrl}
                  onSelectSpeaker={onSelectSpeaker}
                  onCreateSpeaker={onCreateSpeaker}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
