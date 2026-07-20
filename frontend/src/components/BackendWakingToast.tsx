import React from 'react';
import { useStore } from '../store/store';

/**
 * Shown while the backend cold-starts (e.g. on a free-tier host).
 */
const BackendWakingToast: React.FC = () => {
  const { t } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-indigo-500/20 bg-card-bg/85 backdrop-blur-md p-4 shadow-2xl flex items-start gap-3.5 animate-slide-up text-left">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-bold text-text-primary">{t('wakingServerTitle')}</h4>
        <p className="text-[10px] text-text-secondary leading-relaxed">{t('wakingServerDesc')}</p>
      </div>
    </div>
  );
};

export default BackendWakingToast;
