import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Workspace } from './components/Workspace';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';
import { ViewState, SystemMetrics, VoiceModel, PublishedWork } from './types';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { AVAILABLE_MODELS } from './constants';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.WORKSPACE);
  const [importedVoice, setImportedVoice] = useState<VoiceModel | null>(null);
  const { t } = useI18n();

  // App-level State for Settings
  const [backendUrl, setBackendUrl] = useState('http://localhost:9880');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [seed, setSeed] = useState<number>(42);
  const [ttsLanguage, setTtsLanguage] = useState<string>('zh');

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

  // Simulated System Metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    gpuName: 'NVIDIA GeForce RTX 3060',
    vramUsed: 4.2,
    vramTotal: 12,
    temperature: 45,
    backendStatus: 'online',
    latency: 120
  });

  // Simulate metric fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        vramUsed: Math.min(prev.vramTotal, Math.max(2, prev.vramUsed + (Math.random() - 0.5))),
        temperature: Math.floor(Math.max(30, Math.min(85, prev.temperature + (Math.random() * 4 - 2)))),
        latency: Math.floor(Math.max(50, Math.min(300, 120 + (Math.random() * 40 - 20))))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleImportVoice = (voice: VoiceModel) => {
    setImportedVoice(voice);
    setActiveView(ViewState.WORKSPACE);
  };

  const handlePublishWork = (work: PublishedWork) => {
      setPublishedWorks(prev => [work, ...prev]);
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewState.WORKSPACE:
        return (
          <Workspace 
            importedVoice={importedVoice} 
            onClearImport={() => setImportedVoice(null)}
            systemStatus={metrics.backendStatus}
            selectedModel={selectedModel}
            seed={seed}
            ttsLanguage={ttsLanguage}
            onPublish={handlePublishWork}
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
            setBackendUrl={setBackendUrl}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            seed={seed}
            setSeed={setSeed}
            ttsLanguage={ttsLanguage}
            setTtsLanguage={setTtsLanguage}
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
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

export default App;
