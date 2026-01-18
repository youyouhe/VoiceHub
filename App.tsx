import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Workspace } from './components/Workspace';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';
import { ViewState, SystemMetrics, VoiceModel, PublishedWork, SpeakerItem, SystemMetricsResponse, CosyVoiceMode } from './types';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { ThemeProvider } from './theme/ThemeContext';
import { useCosyVoice, useSystemMetrics } from './src/hooks/useCosyVoice';
import { storage } from './src/utils/storage';

const DEFAULT_VALUES = {
  BACKEND_URL: 'http://localhost:9880',
  SEED: 42,
  TTS_LANGUAGE: 'zh',
  TTS_MODE: 'zero_shot'
};

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.WORKSPACE);
  const [importedVoice, setImportedVoice] = useState<VoiceModel | null>(null);
  const { t } = useI18n();

  // Load settings from localStorage on mount
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [seed, setSeed] = useState<number>(0);
  const [ttsLanguage, setTtsLanguage] = useState<string>('');
  const [ttsMode, setTtsMode] = useState<CosyVoiceMode>('zero_shot');

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storage.getSettings();
        if (settings) {
          setBackendUrl(settings.backendUrl || DEFAULT_VALUES.BACKEND_URL);
          setSeed(settings.seed || DEFAULT_VALUES.SEED);
          setTtsLanguage(settings.ttsLanguage || DEFAULT_VALUES.TTS_LANGUAGE);
          setTtsMode((settings.ttsMode as CosyVoiceMode) || DEFAULT_VALUES.TTS_MODE);
        } else {
          // Fallback to localStorage
          const savedBackendUrl = localStorage.getItem('voicehub_backend_url');
          const savedSeed = localStorage.getItem('voicehub_seed');
          const savedLanguage = localStorage.getItem('voicehub_tts_language');
          const savedMode = localStorage.getItem('voicehub_tts_mode');

          if (savedBackendUrl) {
            setBackendUrl(savedBackendUrl);
            await storage.setSetting('backendUrl', savedBackendUrl);
          } else {
            setBackendUrl(DEFAULT_VALUES.BACKEND_URL);
          }

          if (savedSeed) {
            const seedNum = parseInt(savedSeed, 10);
            setSeed(seedNum);
            await storage.setSetting('seed', seedNum);
          } else {
            setSeed(DEFAULT_VALUES.SEED);
          }

          if (savedLanguage) {
            setTtsLanguage(savedLanguage);
            await storage.setSetting('ttsLanguage', savedLanguage);
          } else {
            setTtsLanguage(DEFAULT_VALUES.TTS_LANGUAGE);
          }

          if (savedMode) {
            setTtsMode(savedMode as CosyVoiceMode);
            await storage.setSetting('ttsMode', savedMode);
          } else {
            setTtsMode(DEFAULT_VALUES.TTS_MODE);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to defaults on error
        setBackendUrl(DEFAULT_VALUES.BACKEND_URL);
        setSeed(DEFAULT_VALUES.SEED);
        setTtsLanguage(DEFAULT_VALUES.TTS_LANGUAGE);
        setTtsMode(DEFAULT_VALUES.TTS_MODE);
      }
    };
    loadSettings();
  }, []);

  const saveBackendUrl = async (url: string) => {
    setBackendUrl(url);
    await storage.setSetting('backendUrl', url);
  };

  const saveSeed = async (newSeed: number) => {
    setSeed(newSeed);
    await storage.setSetting('seed', newSeed);
  };

  const saveTtsLanguage = async (lang: string) => {
    setTtsLanguage(lang);
    await storage.setSetting('ttsLanguage', lang);
  };

  const saveTtsMode = async (mode: CosyVoiceMode) => {
    setTtsMode(mode);
    await storage.setSetting('ttsMode', mode);
  };

  // Health check
  const { status: healthStatus, checkHealth } = useCosyVoice(backendUrl);
  
  // System metrics
  const { metrics: systemMetrics, fetchMetrics } = useSystemMetrics(backendUrl);

  // Initial health check and periodic updates
  useEffect(() => {
    checkHealth();
    fetchMetrics();
    const healthInterval = setInterval(() => {
      checkHealth();
    }, 10000);
    const metricsInterval = setInterval(() => {
      fetchMetrics();
    }, 3000);
    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, [backendUrl, checkHealth, fetchMetrics]);

  // App-level State for Published Works
  const [publishedWorks, setPublishedWorks] = useState<PublishedWork[]>([
     // Mock initial published work
     {
         id: 'pw-1',
         title: 'The Little Prince - Intro',
         description: 'A test reading of the classic introduction.',
         author: 'CommunityUser',
         audioUrl: '#',
         duration: 12,
         visibility: 'public',
         likes: 42,
         timestamp: Date.now() - 100000,
         coverColor: 'from-blue-600 to-indigo-900'
     }
  ]);

  // Combine health status and system metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    gpuName: systemMetrics?.gpu.name || 'Unknown',
    vramUsed: systemMetrics ? Math.round((systemMetrics.gpu.vram_used_mb || 0) / 1024) : 0,
    vramTotal: systemMetrics ? Math.round((systemMetrics.gpu.vram_total_mb || 0) / 1024) : 0,
    temperature: systemMetrics?.gpu.temperature_celsius || 0,
    backendStatus: healthStatus?.status === 'healthy' ? 'online' : 'offline',
    latency: 0
  });

  // Update metrics based on real data
  useEffect(() => {
    if (systemMetrics) {
      setMetrics(prev => ({
        ...prev,
        gpuName: systemMetrics.gpu.name || 'Unknown',
        vramUsed: Math.round((systemMetrics.gpu.vram_used_mb || 0) / 1024),
        vramTotal: Math.round((systemMetrics.gpu.vram_total_mb || 0) / 1024),
        temperature: systemMetrics.gpu.temperature_celsius || 0,
        backendStatus: healthStatus?.status === 'healthy' ? 'online' : 'offline'
      }));
    }
  }, [systemMetrics, healthStatus]);

  // Update backend status
  useEffect(() => {
    if (healthStatus) {
      setMetrics(prev => ({
        ...prev,
        backendStatus: healthStatus.status === 'healthy' ? 'online' : 'offline'
      }));
    }
  }, [healthStatus]);

  const handleImportVoice = (voice: VoiceModel) => {
    setImportedVoice(voice);
    setActiveView(ViewState.WORKSPACE);
  };

  const handlePublishWork = (work: PublishedWork) => {
      setPublishedWorks(prev => [work, ...prev]);
  };

  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerItem | null>(null);

  const handleSelectSpeaker = (speaker: SpeakerItem) => {
    setSelectedSpeaker(speaker);
    setActiveView(ViewState.WORKSPACE);
  };

  const handleClearSpeaker = () => {
    setSelectedSpeaker(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewState.WORKSPACE:
        return (
          <Workspace 
            importedVoice={importedVoice} 
            onClearImport={() => setImportedVoice(null)}
            systemStatus={metrics.backendStatus}
            modelName={healthStatus?.modelName || 'Unknown'}
            ttsLanguage={ttsLanguage}
            ttsMode={ttsMode}
            setTtsMode={saveTtsMode}
            backendUrl={backendUrl}
            onPublish={handlePublishWork}
            selectedSpeaker={selectedSpeaker}
            onClearSpeaker={handleClearSpeaker}
          />
        );
      case ViewState.GALLERY:
        return (
            <Gallery 
                onImportVoice={handleImportVoice} 
                publishedWorks={publishedWorks}
            />
        );
      case ViewState.SETTINGS:
        return (
          <Settings 
            backendUrl={backendUrl}
            setBackendUrl={saveBackendUrl}
            ttsLanguage={ttsLanguage}
            setTtsLanguage={saveTtsLanguage}
            ttsMode={ttsMode}
            setTtsMode={saveTtsMode}
            onSelectSpeaker={handleSelectSpeaker}
            onCreateSpeaker={() => setActiveView(ViewState.WORKSPACE)}
            healthStatus={healthStatus}
            systemMetrics={systemMetrics}
          />
        );
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView}
      metrics={metrics}
    >
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
