import React from 'react';
import { useStore } from '../store/store';
import { Sparkles } from 'lucide-react';

const WorkspaceBanner: React.FC = () => {
  const { t } = useStore();

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900/10 via-purple-900/5 to-bg-secondary border border-card-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          {t('bannerTitle')}
        </h2>
        <p className="text-xs text-text-secondary max-w-2xl">
          {t('bannerDesc')}
        </p>
      </div>
    </div>
  );
};

export default WorkspaceBanner;
