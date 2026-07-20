import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useStore } from '../store/store';

export const RackControls: React.FC = () => {
  const {
    strategy,
    setStrategy,
    allowOneAfter,
    setAllowOneAfter,
    solve,
    clearRack,
    isSolving,
    t,
  } = useStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Strategy selector */}
      <div className="flex bg-bg-secondary rounded-lg p-1 border border-card-border">
        {(['backtracking', 'greedy', 'ilp', 'hybrid'] as const).map((strat) => (
          <button
            key={strat}
            onClick={() => setStrategy(strat)}
            className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
              strategy === strat
                ? 'bg-indigo-600 text-white shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {strat}
          </button>
        ))}
      </div>

      {/* Allow one after toggle */}
      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border bg-bg-secondary text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none">
        <input
          type="checkbox"
          checked={allowOneAfter}
          onChange={(e) => setAllowOneAfter(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-card-border text-indigo-600 bg-bg-primary focus:ring-indigo-500 cursor-pointer"
        />
        <span>{t('allowOneAfter')}</span>
      </label>

      {/* Clear rack */}
      <button
        onClick={clearRack}
        className="p-2 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text border border-card-border hover:text-text-primary cursor-pointer"
        title={t('resetRack')}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Solve */}
      <button
        onClick={solve}
        disabled={isSolving}
        className="p-2 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
        title={isSolving ? t('solving') : t('arrangeMelds')}
      >
        {isSolving ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
        <span className="hidden sm:inline">
          {isSolving ? t('solving') : t('arrangeMelds')}
        </span>
      </button>
    </div>
  );
};

export default RackControls;
