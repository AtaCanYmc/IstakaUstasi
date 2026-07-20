import React from 'react';
import Tile from './Tile';
import { useStore } from '../store/store';
import type { Meld, MeldType } from '../services/api';

const MELD_BADGE_CLASSES: Record<MeldType, string> = {
  SERI: 'bg-blue-950/20 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-900/40',
  PER: 'bg-emerald-950/20 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-900/40',
  CIFT: 'bg-indigo-950/20 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-900/40',
  INVALID: 'bg-rose-950/20 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-900/40',
};

const MeldCard: React.FC<{ meld: Meld; t: (key: string) => string }> = ({ meld, t }) => (
  <div className="p-4 rounded-xl bg-panel-bg border border-panel-border flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${MELD_BADGE_CLASSES[meld.type]}`}>
        {meld.type === 'SERI' ? t('runSeri') : meld.type === 'PER' ? t('groupPer') : t('doubleCift')}
      </span>
      <span className="text-xs font-bold text-text-secondary">
        {t('score')}: {meld.score}
      </span>
    </div>
    <div className="flex gap-2.5 flex-wrap">
      {meld.tiles.map((tile, tIdx) => (
        <Tile key={tIdx} tile={tile} />
      ))}
    </div>
  </div>
);

export const SolverResults: React.FC = () => {
  const { solverResult, t } = useStore();

  if (!solverResult) return null;

  return (
    <section className="rounded-2xl border border-card-border bg-card-bg p-6 space-y-6 shadow-sm">
      {/* Header summary */}
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <div>
          <h3 className="text-md font-bold text-text-primary">{t('solverSummary')}</h3>
          <p className="text-xs text-text-secondary">{t('solverSummaryDesc')}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-text-tertiary">{t('meldGroups')}</span>
            <span className="text-lg font-black text-emerald-500 dark:text-emerald-400">
              {solverResult.melds.length}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-text-tertiary">{t('meldsScore')}</span>
            <span className="text-lg font-black text-indigo-500 dark:text-indigo-400">
              {solverResult.totalScore}
            </span>
          </div>
        </div>
      </div>

      {/* Melds listing */}
      <div className="space-y-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary">
          {t('detectedMelds')}
        </h4>
        {solverResult.melds.length === 0 ? (
          <p className="text-xs text-text-tertiary italic">{t('noMelds')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solverResult.melds.map((meld, mIdx) => (
              <MeldCard key={mIdx} meld={meld} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Remaining tiles */}
      {solverResult.remainingTiles.length > 0 && (
        <div className="space-y-3 border-t border-card-border pt-4">
          <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary">
            {t('unarrangedTiles')}
          </h4>
          <div className="flex gap-2.5 flex-wrap bg-panel-bg p-4 rounded-xl border border-panel-border">
            {solverResult.remainingTiles.map((tile, rIdx) => (
              <Tile key={rIdx} tile={tile} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SolverResults;
