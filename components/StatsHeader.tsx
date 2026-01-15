import React from 'react';
import { Activity, Cpu, Thermometer, Wifi, Languages, PanelLeft, PanelLeftClose, Sun, Moon } from 'lucide-react';
import { SystemMetrics } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../theme/ThemeContext';

interface StatsHeaderProps {
  metrics: SystemMetrics;
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ metrics, isNavOpen, onToggleNav }) => {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const vramPercent = (metrics.vramUsed / metrics.vramTotal) * 100;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 dark:text-green-400';
      case 'busy': return 'text-yellow-500 dark:text-yellow-400';
      case 'offline': return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-400';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const statusText = t(`header.${metrics.backendStatus}`);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 px-4 font-mono text-xs text-gray-500 dark:text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-2 select-none h-12 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button 
            onClick={onToggleNav}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            title={t('nav.toggleNav')}
        >
            {isNavOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <span className="font-bold text-gray-800 dark:text-gray-200">VoiceCraft CE</span>
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
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-700 relative">
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

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

        <button 
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={t('header.toggleTheme')}
        >
            {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
        </button>

        <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Switch Language"
        >
            <Languages className="w-3 h-3" />
            <span className="font-sans font-bold">{language.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
};
