import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Save, Wand2, Terminal, Trash2, Mic2, ChevronDown, PanelRightClose, PanelRightOpen, Share, X, Globe, Lock, Upload, Settings2, Volume2, UserPlus, User, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { VoiceModel, GenerationResult, PublishedWork, CosyVoiceMode, SpeakerItem, PresetVoice } from '../types';
import { MOCK_VOICES, TTS_LANGUAGES, CHINESE_DIALECTS } from '../constants';
import { useI18n } from '../i18n/I18nContext';
import { useAudioPlayback, useSpeakerManagement } from '../src/hooks/useCosyVoice';
import { fileToBase64, base64ToBlobUrl, validateAudioFile, formatAudioDuration } from '../src/utils/audio';
import { CreateSpeakerModal } from './CreateSpeakerModal';
import { CosyVoiceService } from '../src/services/cosyvoice';
import { storage } from '../src/utils/storage';

interface PresetVoiceCardProps {
  voice: VoiceModel;
  onClear: () => void;
  onOpenDropdown: () => void;
}

const PresetVoiceCard: React.FC<PresetVoiceCardProps> = ({ voice, onClear, onOpenDropdown }) => {
  const { t } = useI18n();
  const [isReady, setIsReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const configs = await storage.getAllPresetVoices();
        const config = configs[voice.id] || {} as { audioBase64?: string; promptText?: string };
        const hasUserAudio = !!config.audioBase64;
        const hasUserPrompt = !!config.promptText;
        setIsReady(hasUserAudio && hasUserPrompt);
      } catch {
        setIsReady(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [voice.id]);

  if (isLoading) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/50 rounded-xl p-4 flex flex-col gap-3 relative group transition-all">
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const theme = isReady
    ? {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-800',
        hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/20',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-600 dark:text-green-300',
        tagBg: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
        progressBg: 'bg-green-200 dark:bg-green-500/30',
        progressColor: 'bg-green-500',
        chevronColor: 'text-green-400 dark:text-green-300',
        clearHover: 'hover:bg-green-200 dark:hover:bg-green-800',
        clearColor: 'text-green-500'
      }
    : {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        border: 'border-orange-200 dark:border-orange-800',
        hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/20',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        textColor: 'text-orange-600 dark:text-orange-300',
        tagBg: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
        progressBg: 'bg-orange-200 dark:bg-orange-500/30',
        progressColor: 'bg-orange-500',
        chevronColor: 'text-orange-400 dark:text-orange-300',
        clearHover: 'hover:bg-orange-200 dark:hover:bg-orange-800',
        clearColor: 'text-orange-500'
      };

  return (
    <div className={`${theme.bg} ${theme.border} rounded-xl p-4 flex flex-col gap-3 relative group transition-all ${theme.hoverBg}`}>
      <div className="flex items-start gap-3">
        <img src={voice.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="ref" />
        <div>
          <h4 className="text-gray-900 dark:text-white font-bold text-sm">{voice.title}</h4>
          <p className={`text-xs ${theme.textColor}`}>{t('gallery.by')} {voice.author}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${theme.tagBg} ${theme.border}`}>
          Preset
        </span>
        <span className={`inline-flex items-center gap-1 text-xs ${theme.textColor} font-medium`}>
          {isReady ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Ready
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              Not Ready
            </>
          )}
        </span>
        <span className={`px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-[10px] border border-indigo-200 dark:border-indigo-700`}>
          {t(`gallery.filters.${voice.category}`)}
        </span>
      </div>
      <div className={`h-1 ${theme.progressBg} rounded-full w-full overflow-hidden mt-1`}>
        <div className={`h-full ${theme.progressColor} w-full animate-pulse`}></div>
      </div>

      <button
        onClick={onClear}
        className={`absolute top-2 right-2 p-1 rounded ${theme.clearHover} opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        <X className={`w-4 h-4 ${theme.clearColor}`} />
      </button>
      <button
        onClick={onOpenDropdown}
        className="absolute inset-0 w-full h-full opacity-0"
      />
      <div className="absolute top-2 right-8 pointer-events-none">
        <ChevronDown className={`w-4 h-4 ${theme.chevronColor}`} />
      </div>
    </div>
  );
};

interface WorkspaceProps {
  importedVoice: VoiceModel | null;
  onClearImport: () => void;
  systemStatus: string;
  modelName: string;
  ttsLanguage: string;
  ttsMode: CosyVoiceMode;
  setTtsMode: (mode: CosyVoiceMode) => void;
  backendUrl: string;
  onPublish: (work: PublishedWork) => void;
  selectedSpeaker?: SpeakerItem | null;
  onClearSpeaker: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  importedVoice, 
  onClearImport, 
  systemStatus, 
  modelName, 
  ttsLanguage, 
  ttsMode,
  setTtsMode,
  backendUrl, 
  onPublish,
  selectedSpeaker,
  onClearSpeaker
}) => {
  const { t, language } = useI18n();
  const DEMO_TEXTS: Record<string, string> = {
    zh: '欢迎使用 VoiceCraft 社区版。这是一款本地语音合成工具，可以将文字转换为自然的语音。',
    en: 'Welcome to VoiceCraft Community Edition. This is a local text-to-speech generation test.',
    jp: 'VoiceCraft コミュニティエディションへようこそ。これはローカルのテキスト読み上げテストです。',
    ko: 'VoiceCraft 커뮤니티 에디션에 오신 것을 환영합니다. 이것은 로컬 텍스트 음성 합성 테스트입니다.'
  };

  const getDemoText = () => DEMO_TEXTS[ttsLanguage] || DEMO_TEXTS.en;

  const [text, setText] = useState(getDemoText());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<Array<{id: string; text: string; audioBase64: string; duration: number; isPublished: boolean; language: string; mode: string; createdAt: number}>>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Local state for voice selection
  const [activeVoice, setActiveVoice] = useState<VoiceModel | null>(importedVoice);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Reference audio upload state
  const [referenceAudio, setReferenceAudio] = useState<{ base64: string; fileName: string } | null>(null);
  const [referenceText, setReferenceText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Instruct text (only for instruct2 mode)
  const [instructText, setInstructText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playingIdRef = useRef<string | null>(null);
  const { play, stop } = useAudioPlayback();

  useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);

  // TTS Service
  const ttsServiceRef = useRef<CosyVoiceService | null>(null);

  useEffect(() => {
    ttsServiceRef.current = new CosyVoiceService(backendUrl);
  }, [backendUrl]);

  // Publish Modal State
  const [itemToPublish, setItemToPublish] = useState<GenerationResult | null>(null);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishVisibility, setPublishVisibility] = useState<'public' | 'private'>('public');

  // Create Speaker Modal State
  const [isCreateSpeakerModalOpen, setIsCreateSpeakerModalOpen] = useState(false);
  const [createdSpeakerId, setCreatedSpeakerId] = useState<string | null>(null);

  // Custom speakers from API
  const { speakers: customSpeakers, fetchSpeakers } = useSpeakerManagement(backendUrl);

  // Combined speaker list (presets + custom)
  const [selectedCustomSpeaker, setSelectedCustomSpeaker] = useState<string | null>(null);

  // Fetch custom speakers on mount and when modal closes
  useEffect(() => {
    fetchSpeakers();
  }, [backendUrl, isCreateSpeakerModalOpen]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setLogs([t('workspace.logs.init'), `> Connected to ${backendUrl}`]);
  }, [t, backendUrl]);

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

  useEffect(() => {
    if (selectedSpeaker) {
      addLog(`> Selected speaker: ${selectedSpeaker.title}`);
      addLog(`> Mode: ${ttsMode} (change in Settings if needed)`);
    }
  }, [selectedSpeaker, ttsMode]);

  useEffect(() => {
    const demoText = getDemoText();
    if (text === DEMO_TEXTS.en || text === DEMO_TEXTS.zh || 
        text.startsWith('Welcome') || text.startsWith('欢迎使用')) {
      setText(demoText);
    }
  }, [ttsLanguage]);

  useEffect(() => {
    const loadHistory = async () => {
      const items = await storage.getHistory();
      setHistory(items);
    };
    loadHistory();
  }, []);

  const handleCreateSpeakerSuccess = (speakerId: string, language: string) => {
    setCreatedSpeakerId(speakerId);
    const languages = JSON.parse(localStorage.getItem('voicehub_speaker_languages') || '{}');
    languages[speakerId] = language;
    localStorage.setItem('voicehub_speaker_languages', JSON.stringify(languages));
    addLog(`> Speaker '${speakerId}' created successfully (${language})`);
  };
 
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  const getLanguageLabel = (code: string) => {
      const allLangs = [...TTS_LANGUAGES, ...CHINESE_DIALECTS];
      return allLangs.find(l => l.value === code)?.label || code;
  };

  const getDefaultInstruct = (lang: string): string => {
      const instructMap: Record<string, string> = {
          zh: '用自然的声音完整朗读这段文字，不要提前结束<|endofprompt|>',
          yue: '用自然嘅聲音完整朗讀呢段文字，唔好提前結束<|endofprompt|>',
          mn: '用自然的聲音完整朗讀這段文字，不要提前結束<|endofprompt|>',
          en: 'Read the complete text in a natural voice. Do not stop early.<|endofprompt|>',
          jp: 'このテキストを自然な声で最後まで読み上げてください<|endofprompt|>',
          ko: '이 텍스트를 자연스러운 목소리로 끝까지 읽어주세요.<|endofprompt|>',
          de: 'Lesen Sie den vollständigen Text mit einer natürlichen Stimme. Brechen Sie nicht vorzeitig ab.<|endofprompt|>',
          es: 'Lea el texto completo con una voz natural. No se detenga antes de tiempo.<|endofprompt|>',
          fr: 'Lisez le texte complet d\'une voix naturelle. Ne vous arrêtez pas trop tôt.<|endofprompt|>',
          it: 'Leggi il testo completo con una voce naturale. Non fermarti troppo presto.<|endofprompt|>',
          ru: 'Прочитайте полный текст естественным голосом. Не останавливайтесь раньше времени.<|endofprompt|>',
          sichuan: '用自然的声音完整朗读这段文字，不要提前结束<|endofprompt|>',
          dongbei: '用自然的声音完整朗读这段文字，不要提前结束<|endofprompt|>',
          shanghai: '用自然葛声音完整朗读迭段文字，覅提前结束<|endofprompt|>',
          tianjin: '用自然的声音完整朗读这段文字，不要提前结束<|endofprompt|>',
          default: 'Read the complete text in a natural voice. Do not stop early.<|endofprompt|>'
      };
      return instructMap[lang] || instructMap.default;
  };

  const getLocalizedVoice = (voice: VoiceModel) => {
    const localizedTitle = t(`voices.${voice.id}.title`);
    const localizedDesc = t(`voices.${voice.id}.description`);
    return {
      ...voice,
      title: localizedTitle && localizedTitle !== `voices.${voice.id}.title` ? localizedTitle : voice.title,
      description: localizedDesc && localizedDesc !== `voices.${voice.id}.description` ? localizedDesc : voice.description
    };
  };

  const localizedActiveVoice = activeVoice ? getLocalizedVoice(activeVoice) : null;
  const localizedVoices = MOCK_VOICES.map(getLocalizedVoice);

  const handleVoiceSelect = (voice: VoiceModel) => {
      setActiveVoice(voice);
      setSelectedCustomSpeaker(null);
      setIsVoiceDropdownOpen(false);
      const localized = getLocalizedVoice(voice);
      addLog(`${t('workspace.logs.voiceSelected')} ${localized.title}`);
  };

  const handleCustomSpeakerSelect = (speakerId: string) => {
      setSelectedCustomSpeaker(speakerId);
      setActiveVoice(null);
      setIsVoiceDropdownOpen(false);
      addLog(`> Selected speaker: ${speakerId}`);
      addLog(`> Mode: ${ttsMode} (change in Settings if needed)`);
  };

  const handleClearSelection = () => {
      setActiveVoice(null);
      setSelectedCustomSpeaker(null);
      clearReferenceAudio();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setReferenceAudio({ base64, fileName: file.name });
      addLog(`${t('workspace.logs.loadedRef')} ${file.name}`);
    } catch (err) {
      setUploadError('Failed to read audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearReferenceAudio = () => {
    setReferenceAudio(null);
    setReferenceText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = useCallback(async () => {
    if (systemStatus === 'offline') {
      addLog(t('workspace.logs.backendOffline'));
      return;
    }

    if (!text.trim()) {
      addLog(t('workspace.logs.emptyText'));
      return;
    }

    if (ttsMode === 'instruct2' || ttsMode === 'zero_shot') {
      if (!activeVoice && !selectedCustomSpeaker) {
        addLog(t('workspace.logs.noVoice'));
        return;
      }
    } else {
      if (!referenceAudio) {
        addLog('> ERROR: No reference audio uploaded for this mode.');
        return;
      }
    }

    setIsGenerating(true);
    setProgress(0);
    addLog(`${t('workspace.logs.starting')} ${modelName}...`);
    addLog(`> Mode: ${ttsMode}`);
    const currentSeed = Math.floor(Math.random() * 999999);
    addLog(`> Seed: ${currentSeed}`);
    addLog(`> Language: ${getLanguageLabel(ttsLanguage)}`);

    try {
      setProgress(10);
      
      if (!ttsServiceRef.current) {
        ttsServiceRef.current = new CosyVoiceService(backendUrl);
      }
      
      const request: Parameters<typeof ttsServiceRef.current.textToSpeech>[0] = {
        text,
        mode: ttsMode,
        speed: 1.0,
        seed: currentSeed
      };

      if (ttsMode === 'zero_shot' && selectedCustomSpeaker) {
        request.speakerId = selectedCustomSpeaker;
        addLog(`> Using speaker: ${selectedCustomSpeaker}`);
      } else if (ttsMode === 'instruct2' && selectedCustomSpeaker) {
        request.speakerId = selectedCustomSpeaker;
        const defaultInstruct = getDefaultInstruct(ttsLanguage);
        const finalInstruct = instructText || defaultInstruct;
        request.instructText = finalInstruct;
        addLog(`> Instruct: "${finalInstruct.replace('<|endofprompt|>', '')}"`);
      } else if (activeVoice) {
        const isPresetVoice = MOCK_VOICES.some(v => v.id === activeVoice.id);
        if (isPresetVoice) {
          const presetConfigs = await storage.getAllPresetVoices();
          const config = presetConfigs[activeVoice.id] || {} as { audioBase64?: string; promptText?: string };
          const customAudioBase64 = config.audioBase64;
          const customPromptText = config.promptText;

          if (customAudioBase64 && customPromptText) {
            request.promptText = customPromptText;
            request.promptAudio = customAudioBase64;
            addLog(`> Using preset voice: ${activeVoice.title}`);
          } else {
            addLog('> ERROR: Selected preset voice has no audio or prompt text configured. Please configure it first.');
            setIsGenerating(false);
            return;
          }
        } else if (referenceAudio) {
          request.promptText = referenceText;
          request.promptAudio = referenceAudio.base64;
        } else {
          addLog('> ERROR: No voice reference configured');
          setIsGenerating(false);
          return;
        }
      } else if (referenceAudio) {
        request.promptText = referenceText;
        request.promptAudio = referenceAudio.base64;
      }

      const result = await ttsServiceRef.current.textToSpeech(request);

      if (result && result.success) {
        setProgress(90);

        const newItem = {
          id: Date.now().toString(),
          text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          audioBase64: result.audioData,
          duration: result.duration,
          isPublished: false,
          language: ttsLanguage,
          mode: ttsMode
        };

        await storage.addHistory(newItem);
        setHistory(prev => [newItem, ...prev].slice(0, 50));
        setProgress(100);
        addLog(t('workspace.logs.complete'));
      } else {
        addLog('> ERROR: Generation failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`> ERROR: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [systemStatus, text, ttsMode, referenceAudio, referenceText, activeVoice, selectedCustomSpeaker, ttsLanguage, backendUrl, addLog, instructText]);

  const handlePlayAudio = async (item: {id: string; audioBase64: string}) => {
    if (playingId === item.id) {
      stop();
      setPlayingId(null);
      playingIdRef.current = null;
    } else {
      if (playingId) {
        stop();
      }
      try {
        const blobUrl = base64ToBlobUrl(item.audioBase64);
        await play(blobUrl);
        if (playingIdRef.current === item.id) {
          setPlayingId(null);
          playingIdRef.current = null;
        }
      } catch (err) {
        addLog('> ERROR: Failed to play audio');
        if (playingIdRef.current === item.id) {
          setPlayingId(null);
          playingIdRef.current = null;
        }
      }
    }
  };

  const handleDownloadAudio = (item: {id: string; audioBase64: string; text: string}) => {
    try {
      const blob = base64ToBlobUrl(item.audioBase64);
      const link = document.createElement('a');
      link.href = blob;
      link.download = `voicecraft_${item.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog(`> Downloaded audio for: ${item.text}`);
    } catch (err) {
      addLog('> ERROR: Failed to download audio');
    }
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

      const audioUrl = base64ToBlobUrl(itemToPublish.audioBase64);

      const newWork: PublishedWork = {
          id: `pub-${itemToPublish.id}`,
          title: publishTitle || itemToPublish.text,
          description: publishDesc || 'No description provided.',
          author: 'You',
          audioUrl,
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
                        {referenceAudio ? (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/50 rounded-xl p-4 flex flex-col gap-3 relative group transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                                            <Volume2 className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-bold text-sm">{referenceAudio.fileName}</h4>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-300">{t('workspace.referenceAudio')}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={clearReferenceAudio}
                                        className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded"
                                    >
                                        <X className="w-4 h-4 text-indigo-400" />
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    <input 
                                        type="text"
                                        placeholder={t('workspace.referenceTextPlaceholder')}
                                        value={referenceText}
                                        onChange={(e) => setReferenceText(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 w-full h-full opacity-0"
                                />
                                <div className="absolute top-2 right-2 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-indigo-400 dark:text-indigo-300" />
                                </div>
                            </div>
                        ) : localizedActiveVoice ? (
                            <PresetVoiceCard
                              voice={localizedActiveVoice}
                              onClear={() => {
                                setActiveVoice(null);
                                setIsVoiceDropdownOpen(false);
                              }}
                              onOpenDropdown={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                            />
                        ) : selectedCustomSpeaker ? (
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/50 rounded-xl p-4 flex flex-col gap-3 relative group transition-all hover:bg-green-100 dark:hover:bg-green-900/40">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                        <User className="w-6 h-6 text-green-600 dark:text-green-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-bold text-sm">{selectedCustomSpeaker}</h4>
                                        <p className="text-xs text-green-600 dark:text-green-300">{t('speaker.ready')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-[10px] border border-green-200 dark:border-green-700">
                                        Custom Speaker
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-[10px] border border-indigo-200 dark:border-indigo-700">
                                        {ttsMode === 'zero_shot' ? 'Zero Shot' : ttsMode === 'cross_lingual' ? 'Cross Lingual' : 'Instruct2'}
                                    </span>
                                </div>
                                <div className="h-1 bg-green-200 dark:bg-green-500/30 rounded-full w-full overflow-hidden mt-1">
                                    <div className="h-full bg-green-500 w-full animate-pulse"></div>
                                </div>
                                
                                <button 
                                    onClick={handleClearSelection}
                                    className="absolute top-2 right-2 p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4 text-green-500" />
                                </button>
                                <button 
                                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                    className="absolute inset-0 w-full h-full opacity-0"
                                />
                                <div className="absolute top-2 right-8 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-green-400 dark:text-green-300" />
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all h-40"
                            >
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">{t('workspace.uploadRefAudio')}</span>
                                <span className="text-xs text-gray-400">{t('workspace.support')}</span>
                            </button>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".wav,.mp3,audio/wav,audio/mp3"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Dropdown Menu */}
                        {isVoiceDropdownOpen && !referenceAudio && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 max-h-96 overflow-y-auto">
                                {/* Custom Speakers Section */}
                                {customSpeakers.length > 0 && (
                                    <>
                                        <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
                                            <h5 className="text-xs font-bold text-indigo-500 px-2 py-1 uppercase">
                                                {t('speaker.management')} ({customSpeakers.length})
                                            </h5>
                                        </div>
                                        {customSpeakers.map((speakerId) => (
                                            <button
                                                key={speakerId}
                                                onClick={() => handleCustomSpeakerSelect(speakerId)}
                                                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800/50 ${
                                                    selectedCustomSpeaker === speakerId ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-gray-800 dark:text-gray-200 text-sm font-medium truncate">{speakerId}</h4>
                                                        <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-1.5 rounded">Custom</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {/* Preset Voices Section */}
                                <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
                                    <h5 className="text-xs font-bold text-gray-500 px-2 py-1 uppercase">{t('workspace.selectPlaceholder')}</h5>
                                </div>
                                {localizedVoices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        onClick={() => handleVoiceSelect(voice)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800/50 ${
                                            activeVoice?.id === voice.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                                        }`}
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

                        {/* Create New Speaker Button */}
                        <button 
                            onClick={() => setIsCreateSpeakerModalOpen(true)}
                            className="mt-2 w-full border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-2 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('speaker.create')}</span>
                        </button>
                    </div>
                    
                    {/* Info text */}
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {referenceAudio 
                                ? t('workspace.audioLoadedInfo') 
                                : selectedCustomSpeaker
                                    ? `> Selected custom speaker: ${selectedCustomSpeaker} (${ttsMode} mode)`
                                    : localizedActiveVoice 
                                        ? localizedActiveVoice.description 
                                        : t('workspace.noVoiceSelected')}
                        </p>
                    </div>
                </div>

                {/* Text Input */}
                <div className="w-full md:w-2/3 flex flex-col gap-4 h-full">
                    {/* Instruct Input (only for instruct2 mode) */}
                    {ttsMode === 'instruct2' && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span>Instruction</span>
                                <span className="text-xs font-normal text-gray-500">(Optional - leave empty for default)</span>
                            </label>
                            <input 
                                type="text"
                                value={instructText}
                                onChange={(e) => setInstructText(e.target.value)}
                                placeholder={getDefaultInstruct(ttsLanguage).replace('<|endofprompt|>', '')}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-500">
                                Default: "{getDefaultInstruct(ttsLanguage).replace('<|endofprompt|>', '')}"
                            </p>
                        </div>
                    )}

                    {/* Text Input Box */}
                    <div className="flex flex-col gap-2 h-full">
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
        </div>

        {/* Generate Bar */}
        <div className="flex items-center gap-4">
             <button 
                 onClick={handleGenerate}
                 disabled={isGenerating || (!activeVoice && !selectedCustomSpeaker)}
                 className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                     isGenerating || (!activeVoice && !selectedCustomSpeaker)
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
                    <button className="p-1 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={async () => {
                      await storage.clearHistory();
                      setHistory([]);
                    }}><Trash2 className="w-3 h-3" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                    {history.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-600 text-xs py-10">{t('workspace.noGenerations')}</div>
                    )}
                    {history.map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors group relative border border-gray-200 dark:border-transparent">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500 font-mono">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : '--:--'}
                                </span>
                                <div className="flex items-center gap-2">
                                    {item.isPublished && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-1 rounded border border-indigo-200 dark:border-indigo-800">{t('workspace.published')}</span>}
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded">{typeof item.duration === 'number' ? `${item.duration.toFixed(2)}s` : '--s'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{item.text || 'No text'}</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => item.audioBase64 ? handlePlayAudio(item) : undefined}
                                    disabled={!item.audioBase64}
                                    className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                                        playingId === item.id
                                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                                            : 'bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white'
                                    }`}
                                >
                                    {playingId === item.id ? (
                                        <>
                                            <div className="w-3 h-3 bg-current rounded-sm animate-pulse" />
                                            {t('workspace.stop')}
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-3 h-3" /> {t('workspace.play')}
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDownloadAudio(item)}
                                    title={t('workspace.download')}
                                    className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <Download className="w-3 h-3" />
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

      {/* Create Speaker Modal */}
      <CreateSpeakerModal
        isOpen={isCreateSpeakerModalOpen}
        onClose={() => setIsCreateSpeakerModalOpen(false)}
        backendUrl={backendUrl}
        existingSpeakers={customSpeakers}
        onSuccess={handleCreateSpeakerSuccess}
      />
    </div>
  );
};
