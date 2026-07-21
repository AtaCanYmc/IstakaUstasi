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
      {/* Strategy selector dropdown */}
      <div className="relative">
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as any)}
          className="appearance-none bg-bg-secondary text-text-primary border border-card-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-text-secondary/35 cursor-pointer transition-all min-w-[140px]"
        >
          <option value="backtracking">{t('stratBacktracking')}</option>
          <option value="greedy">{t('stratGreedy')}</option>
          <option value="ilp">{t('stratIlp')}</option>
          <option value="hybrid">{t('stratHybrid')}</option>
          <option value="beam">{t('stratBeam')}</option>
          <option value="genetic">{t('stratGenetic')}</option>
          <option value="annealing">{t('stratAnnealing')}</option>
          <option value="mcts">{t('stratMcts')}</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-secondary">
          <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
