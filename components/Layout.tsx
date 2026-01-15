import React, { useState } from 'react';
import { LayoutDashboard, Globe, Settings, Github } from 'lucide-react';
import { ViewState, SystemMetrics } from '../types';
import { StatsHeader } from './StatsHeader';
import { useI18n } from '../i18n/I18nContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  metrics: SystemMetrics;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, metrics }) => {
  const { t } = useI18n();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const navItems = [
    { id: ViewState.WORKSPACE, label: t('nav.workbench'), icon: LayoutDashboard },
    { id: ViewState.GALLERY, label: t('nav.community'), icon: Globe },
    { id: ViewState.SETTINGS, label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Bar: Stats */}
      <StatsHeader 
        metrics={metrics} 
        isNavOpen={isNavOpen} 
        onToggleNav={() => setIsNavOpen(!isNavOpen)} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-white dark:bg-gray-900 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            isNavOpen ? 'w-16 md:w-64 border-r border-gray-200 dark:border-gray-800' : 'w-0 border-r-0'
        }`}>
          <div>
            <nav className="flex flex-col p-2 space-y-1 mt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 min-w-[1.25rem] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                    <span className="hidden md:block font-medium opacity-100 transition-opacity duration-200">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 hidden md:block">
            <button className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 transition-colors font-medium">
                <Github className="w-4 h-4" /> 
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('nav.starRepo')}</span>
            </button>
            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 whitespace-nowrap">{t('nav.version')}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};
