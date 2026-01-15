import React, { useState } from 'react';
import { Search, Heart, Download, Play, Pause, Share2, BookOpen, Lock, Globe as GlobeIcon, Headphones } from 'lucide-react';
import { VoiceModel, PublishedWork } from '../types';
import { MOCK_VOICES } from '../constants';
import { useI18n } from '../i18n/I18nContext';

interface GalleryProps {
  onImportVoice: (voice: VoiceModel) => void;
  publishedWorks: PublishedWork[];
}

export const Gallery: React.FC<GalleryProps> = ({ onImportVoice, publishedWorks }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voices' | 'audiobooks'>('voices');
  const [activeFilter, setActiveFilter] = useState('All');

  // Dynamically get filters from keys or define them. 
  // We use the keys from translation file to ensure they match translation keys.
  const voiceFilters = ['All', 'Anime', 'Game', 'News', 'Narrator', 'Real', 'Radio'];

  const handlePlayToggle = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // Simulate playback ending after 3 seconds
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  // Localize voices
  const localizedVoices = MOCK_VOICES.map(voice => ({
    ...voice,
    title: t(`voices.${voice.id}.title`) || voice.title,
    description: t(`voices.${voice.id}.description`) || voice.description
  }));

  const filteredVoices = localizedVoices.filter(voice => {
    const matchesSearch = voice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          voice.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || voice.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredWorks = publishedWorks.filter(work => {
      // Only show public works or my private works (simulated "You" author)
      if (work.visibility === 'private' && work.author !== 'You') return false;
      const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            work.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
  });

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('gallery.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('gallery.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
             <button
                onClick={() => setActiveTab('voices')}
                className={`pb-3 px-2 font-bold text-sm transition-colors relative ${activeTab === 'voices' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
             >
                {t('gallery.tabs.voices')}
                {activeTab === 'voices' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-t-full" />}
             </button>
             <button
                onClick={() => setActiveTab('audiobooks')}
                className={`pb-3 px-2 font-bold text-sm transition-colors relative ${activeTab === 'audiobooks' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
             >
                {t('gallery.tabs.audiobooks')}
                {activeTab === 'audiobooks' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-t-full" />}
             </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
                type="text" 
                placeholder={t('gallery.searchPlaceholder')}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            {activeTab === 'voices' && (
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {voiceFilters.map(filter => (
                    <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                        activeFilter === filter 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    >
                    {t(`gallery.filters.${filter}`)}
                    </button>
                ))}
                </div>
            )}
        </div>
      </div>

      {activeTab === 'voices' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVoices.map((voice) => (
            <div key={voice.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-400 dark:hover:border-gray-500 transition-all group shadow-sm dark:shadow-none">
                <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                <img src={voice.imageUrl} alt={voice.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                    <h3 className="text-lg font-bold text-white truncate drop-shadow-md">{voice.title}</h3>
                    <p className="text-xs text-indigo-200 font-mono drop-shadow-md">{t('gallery.by')}: {voice.author}</p>
                    </div>
                    <button 
                    onClick={() => handlePlayToggle(voice.id)}
                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                    >
                    {playingId === voice.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </button>
                </div>
                </div>

                <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-700/50 font-bold">
                        {t(`gallery.filters.${voice.category}`)}
                    </span>
                    {voice.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs border border-gray-200 dark:border-gray-600">
                        #{tag}
                    </span>
                    ))}
                </div>

                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm mb-4">
                    <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{(voice.likes / 1000).toFixed(1)}{t('gallery.likes')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{voice.downloads}</span>
                    </div>
                    </div>
                    <div className="font-mono text-xs">{voice.duration}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                    className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                    <Share2 className="w-4 h-4" />
                    {t('gallery.details')}
                    </button>
                    <button 
                    onClick={() => onImportVoice(voice)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                    <Download className="w-4 h-4" />
                    {t('gallery.useThis')}
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorks.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                      No Audiobooks found.
                  </div>
              )}
              {filteredWorks.map((work) => (
                  <div key={work.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-400 dark:hover:border-gray-500 transition-all flex flex-col shadow-sm dark:shadow-none">
                       {/* Audiobook Cover */}
                       <div className={`h-48 bg-gradient-to-br ${work.coverColor} p-6 relative flex flex-col justify-between`}>
                           <div className="flex justify-between items-start">
                               <div className="bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                                   <BookOpen className="w-6 h-6 text-white/90" />
                               </div>
                               {work.visibility === 'private' ? (
                                   <div className="bg-black/40 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 backdrop-blur-md">
                                       <Lock className="w-3 h-3" /> {t('gallery.private')}
                                   </div>
                               ) : (
                                   <div className="bg-emerald-500/20 px-2 py-1 rounded text-[10px] text-emerald-100 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                                       <GlobeIcon className="w-3 h-3" /> {t('gallery.public')}
                                   </div>
                               )}
                           </div>
                           
                           <div>
                               <h3 className="text-xl font-serif font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">{work.title}</h3>
                               <p className="text-sm text-white/80 mt-1 drop-shadow-sm">{t('gallery.by')} {work.author}</p>
                           </div>

                           <button 
                                onClick={() => handlePlayToggle(work.id)}
                                className="absolute bottom-[-20px] right-6 w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center shadow-lg transition-transform hover:scale-105 border-4 border-white dark:border-gray-800"
                            >
                                {playingId === work.id ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 ml-1 text-white" />}
                           </button>
                       </div>

                       <div className="p-6 pt-8 flex-1 flex flex-col">
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">{work.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-4">
                                <div className="flex items-center gap-1">
                                    <Headphones className="w-3 h-3" />
                                    <span>{Math.floor(Math.random() * 500) + work.likes}</span>
                                </div>
                                <div className="font-mono">
                                    {new Date(work.timestamp).toLocaleDateString()} • {work.duration}s
                                </div>
                            </div>
                       </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
