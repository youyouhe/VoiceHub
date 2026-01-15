import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, Wand2, Terminal, Trash2, Mic2, ChevronDown, PanelRightClose, PanelRightOpen, Share, X, Globe, Lock } from 'lucide-react';
import { VoiceModel, GenerationResult, PublishedWork } from '../types';
import { MOCK_VOICES, TTS_LANGUAGES, CHINESE_DIALECTS } from '../constants';
import { useI18n } from '../i18n/I18nContext';

interface WorkspaceProps {
  importedVoice: VoiceModel | null;
  onClearImport: () => void;
  systemStatus: string;
  selectedModel: string;
  seed: number;
  ttsLanguage: string;
  onPublish: (work: PublishedWork) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ importedVoice, onClearImport, systemStatus, selectedModel, seed, ttsLanguage, onPublish }) => {
  const { t, language } = useI18n();
  const [text, setText] = useState('Welcome to VoiceCraft Community Edition. This is a local text-to-speech generation test.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Local state for voice selection
  const [activeVoice, setActiveVoice] = useState<VoiceModel | null>(importedVoice);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Publish Modal State
  const [itemToPublish, setItemToPublish] = useState<GenerationResult | null>(null);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishVisibility, setPublishVisibility] = useState<'public' | 'private'>('public');

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setLogs([t('workspace.logs.init'), t('workspace.logs.connected')]);
  }, [t]); 

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (importedVoice) {
      setActiveVoice(importedVoice);
      addLog(`${t('workspace.logs.imported')} ${importedVoice.title} (${importedVoice.id})`);
    }
  }, [importedVoice, t]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  const getLanguageLabel = (code: string) => {
      const allLangs = [...TTS_LANGUAGES, ...CHINESE_DIALECTS];
      return allLangs.find(l => l.value === code)?.label || code;
  };

  const getLocalizedVoice = (voice: VoiceModel) => ({
    ...voice,
    title: t(`voices.${voice.id}.title`) || voice.title,
    description: t(`voices.${voice.id}.description`) || voice.description
  });

  const localizedActiveVoice = activeVoice ? getLocalizedVoice(activeVoice) : null;
  const localizedVoices = MOCK_VOICES.map(getLocalizedVoice);

  const handleVoiceSelect = (voice: VoiceModel) => {
      setActiveVoice(voice);
      setIsVoiceDropdownOpen(false);
      const localized = getLocalizedVoice(voice);
      addLog(`${t('workspace.logs.voiceSelected')} ${localized.title}`);
  };

  const handleGenerate = () => {
    if (systemStatus === 'offline') {
      addLog(t('workspace.logs.backendOffline'));
      return;
    }

    if (!activeVoice) {
        addLog(t('workspace.logs.noVoice'));
        return;
    }

    if (!text.trim()) {
      addLog(t('workspace.logs.emptyText'));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    addLog(`${t('workspace.logs.starting')} ${selectedModel}...`);
    addLog(`${t('workspace.logs.seed')} ${seed}`);
    addLog(`${t('workspace.logs.lang')} ${getLanguageLabel(ttsLanguage)}`);

    // Simulate local generation progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Complete generation
        const newResult: GenerationResult = {
          id: Date.now().toString(),
          text: text.slice(0, 30) + '...',
          timestamp: Date.now(),
          duration: Math.floor(Math.random() * 5) + 2,
          audioUrl: '#', // Mock
          isPublished: false
        };
        
        setHistory(prev => [newResult, ...prev]);
        setIsGenerating(false);
        addLog(t('workspace.logs.complete'));
      }
      setProgress(currentProgress);
    }, 500);
  };

  const openPublishModal = (item: GenerationResult) => {
      setItemToPublish(item);
      setPublishTitle('');
      setPublishDesc('');
      setPublishVisibility('public');
  };

  const confirmPublish = () => {
      if (!itemToPublish) return;

      const colors = [
          'from-purple-600 to-blue-900',
          'from-emerald-600 to-teal-900',
          'from-rose-600 to-pink-900',
          'from-amber-600 to-orange-900',
          'from-cyan-600 to-blue-900'
      ];
      
      const newWork: PublishedWork = {
          id: `pub-${itemToPublish.id}`,
          title: publishTitle || itemToPublish.text,
          description: publishDesc || 'No description provided.',
          author: 'You',
          audioUrl: itemToPublish.audioUrl,
          duration: itemToPublish.duration,
          visibility: publishVisibility,
          likes: 0,
          timestamp: Date.now(),
          coverColor: colors[Math.floor(Math.random() * colors.length)]
      };

      onPublish(newWork);
      
      // Update local history status
      setHistory(prev => prev.map(item => 
          item.id === itemToPublish.id ? { ...item, isPublished: true } : item
      ));

      addLog(`${t('workspace.logs.published')} ${newWork.title}`);
      setItemToPublish(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden relative">
      
      {/* Publish Modal Overlay */}
      {itemToPublish && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-850">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Share className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          {t('workspace.publishModal.title')}
                      </h3>
                      <button onClick={() => setItemToPublish(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">{t('workspace.publishModal.workTitle')}</label>
                          <input 
                              type="text" 
                              className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder={t('workspace.publishModal.workTitlePlaceholder')}
                              value={publishTitle}
                              onChange={(e) => setPublishTitle(e.target.value)}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">{t('workspace.publishModal.description')}</label>
                          <textarea 
                              className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                              placeholder={t('workspace.publishModal.descriptionPlaceholder')}
                              value={publishDesc}
                              onChange={(e) => setPublishDesc(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">{t('workspace.publishModal.visibility')}</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                  onClick={() => setPublishVisibility('public')}
                                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                                      publishVisibility === 'public' 
                                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-white' 
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                                  }`}
                              >
                                  <Globe className="w-4 h-4" />
                                  <span className="text-sm">{t('gallery.public')}</span>
                              </button>
                              <button 
                                  onClick={() => setPublishVisibility('private')}
                                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                                      publishVisibility === 'private' 
                                      ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-700 dark:text-white' 
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                                  }`}
                              >
                                  <Lock className="w-4 h-4" />
                                  <span className="text-sm">{t('gallery.private')}</span>
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-850 flex justify-end gap-3">
                      <button 
                          onClick={() => setItemToPublish(null)}
                          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      >
                          {t('workspace.publishModal.cancel')}
                      </button>
                      <button 
                          onClick={confirmPublish}
                          className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-colors flex items-center gap-2"
                      >
                          <Share className="w-4 h-4" />
                          {t('workspace.publishModal.confirm')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Left Panel: Controls */}
      <div className={`relative h-full flex flex-col p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800 gap-6 transition-all duration-300 ease-in-out ${showSidebar ? 'w-full md:w-2/3 lg:w-3/4' : 'w-full'}`}>
        
        {/* Toggle Sidebar Button */}
        <div className="absolute top-6 right-6 z-20">
            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 shadow-md"
                title={t('workspace.toggleSidebar')}
            >
                {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
        </div>

        {/* Prompt Section */}
        <div className="flex flex-col gap-4 flex-grow">
            <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Voice Selection Box */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Mic2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        {t('workspace.voiceReference')}
                    </label>
                    
                    <div className="relative">
                        {/* Selected Voice Card */}
                        {localizedActiveVoice ? (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/50 rounded-xl p-4 flex flex-col gap-3 relative group transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                                <div className="flex items-start gap-3">
                                    <img src={localizedActiveVoice.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="ref" />
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-bold text-sm">{localizedActiveVoice.title}</h4>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-300">{t('gallery.by')} {localizedActiveVoice.author}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-[10px] border border-indigo-200 dark:border-indigo-700">
                                        {t(`gallery.filters.${localizedActiveVoice.category}`)}
                                    </span>
                                </div>
                                <div className="h-1 bg-indigo-200 dark:bg-indigo-500/30 rounded-full w-full overflow-hidden mt-1">
                                    <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
                                </div>
                                
                                <button 
                                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                    className="absolute inset-0 w-full h-full opacity-0"
                                />
                                <div className="absolute top-2 right-2 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-indigo-400 dark:text-indigo-300" />
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all h-40"
                            >
                                <Mic2 className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">{t('workspace.selectVoice')}</span>
                            </button>
                        )}

                        {/* Dropdown Menu */}
                        {isVoiceDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                                <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
                                    <h5 className="text-xs font-bold text-gray-500 px-2 py-1 uppercase">{t('workspace.selectPlaceholder')}</h5>
                                </div>
                                {localizedVoices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        onClick={() => handleVoiceSelect(voice)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800/50 last:border-0"
                                    >
                                        <img src={voice.imageUrl} className="w-8 h-8 rounded object-cover" alt={voice.title} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-gray-800 dark:text-gray-200 text-sm font-medium truncate">{voice.title}</h4>
                                                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 rounded">{t(`gallery.filters.${voice.category}`)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{voice.author}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Info text */}
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {localizedActiveVoice ? localizedActiveVoice.description : t('workspace.noVoiceSelected')}
                        </p>
                    </div>
                </div>

                {/* Text Input Box */}
                <div className="w-full md:w-2/3 flex flex-col gap-2 h-full">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                        <span>{t('workspace.inputText')}</span>
                        <span className="text-xs font-mono text-gray-500">{text.length} {t('workspace.chars')}</span>
                    </label>
                    <textarea 
                        className="w-full h-full min-h-[200px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-sans text-lg leading-relaxed resize-none transition-colors"
                        placeholder={t('workspace.inputPlaceholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Generate Bar */}
        <div className="flex items-center gap-4">
             <button 
                onClick={handleGenerate}
                disabled={isGenerating || !activeVoice}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    isGenerating || !activeVoice
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-400' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50'
                }`}
             >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {t('workspace.generating')} {Math.floor(progress)}%
                    </>
                ) : (
                    <>
                        <Wand2 className="w-5 h-5" />
                        {t('workspace.generate')}
                    </>
                )}
             </button>
        </div>

      </div>

      {/* Right Panel: Logs & History */}
      {showSidebar && (
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-10 duration-300">
            {/* Console Log */}
            <div className="h-1/2 p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase">{t('workspace.systemLog')}</span>
                </div>
                {/* Keep Terminal Dark even in Light Mode for geekiness */}
                <div className="flex-1 bg-gray-900 dark:bg-black rounded-lg p-3 overflow-y-auto font-mono text-xs space-y-1 shadow-inner">
                    {logs.map((log, i) => (
                        <div key={i} className="text-emerald-400 dark:text-emerald-500/80 break-words">{log}</div>
                    ))}
                    <div ref={consoleEndRef} />
                </div>
            </div>

            {/* History */}
            <div className="h-1/2 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-4">
                    <span className="text-xs font-mono font-bold uppercase">{t('workspace.history')} (./outputs)</span>
                    <button className="p-1 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setHistory([])}><Trash2 className="w-3 h-3" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                    {history.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-600 text-xs py-10">{t('workspace.noGenerations')}</div>
                    )}
                    {history.map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors group relative border border-gray-200 dark:border-transparent">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                <div className="flex items-center gap-2">
                                    {item.isPublished && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-1 rounded border border-indigo-200 dark:border-indigo-800">{t('workspace.published')}</span>}
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded">{item.duration}s</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{item.text}</p>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors">
                                    <Play className="w-3 h-3" /> {t('workspace.play')}
                                </button>
                                <button 
                                    onClick={() => openPublishModal(item)}
                                    title={t('workspace.publish')}
                                    disabled={!!item.isPublished}
                                    className={`p-1.5 rounded transition-colors ${item.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Share className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
