import React from 'react';
import { Activity, Cpu, Thermometer, Wifi, Languages, PanelLeft, PanelLeftClose } from 'lucide-react';
import { SystemMetrics } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface StatsHeaderProps {
  metrics: SystemMetrics;
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ metrics, isNavOpen, onToggleNav }) => {
  const { t, language, setLanguage } = useI18n();
  const vramPercent = (metrics.vramUsed / metrics.vramTotal) * 100;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const statusText = t(`header.${metrics.backendStatus}`);

  return (
    <div className="bg-gray-900 border-b border-gray-800 p-2 px-4 font-mono text-xs text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-2 select-none h-12">
      <div className="flex items-center gap-4">
        <button 
            onClick={onToggleNav}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title={t('nav.toggleNav')}
        >
            {isNavOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <span className="font-bold text-gray-200">VoiceCraft CE</span>
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <Wifi className="w-3 h-3" />
          <span className={`uppercase font-bold ${getStatusColor(metrics.backendStatus)}`}>
            {t('header.localApi')}: {statusText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Cpu className="w-3 h-3" />
          <span>{metrics.gpuName}</span>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap hidden sm:flex">
          <div className="w-24 h-3 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${vramPercent}%` }}
            />
          </div>
          <span>{metrics.vramUsed.toFixed(1)}GB / {metrics.vramTotal}GB</span>
        </div>

        <div className="flex items-center gap-1 hidden sm:flex">
          <Thermometer className="w-3 h-3" />
          <span>{metrics.temperature}°C</span>
        </div>

        <div className="flex items-center gap-1 hidden sm:flex">
          <Activity className="w-3 h-3" />
          <span>{metrics.latency}ms</span>
        </div>

        <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-gray-300 hover:text-white transition-colors"
            title="Switch Language"
        >
            <Languages className="w-3 h-3" />
            <span className="font-sans font-bold">{language.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
};
