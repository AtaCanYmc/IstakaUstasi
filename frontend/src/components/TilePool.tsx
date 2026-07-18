import React, { useState } from 'react';
import { useStore } from '../store/store';
import type { TileColor, Tile as TileType } from '../services/api';
import Tile from './Tile';

export const TilePool: React.FC = () => {
  const addTile = useStore((state) => state.addTile);
  const okeyMeta = useStore((state) => state.okeyMeta);
  const setOkeyMeta = useStore((state) => state.setOkeyMeta);
  const clearRack = useStore((state) => state.clearRack);
  const t = useStore((state) => state.t);
  const [selectedColor, setSelectedColor] = useState<TileColor>('RED');
  const [mode, setMode] = useState<'add' | 'indicator'>('add');

  const colors: TileColor[] = ['RED', 'BLACK', 'BLUE', 'YELLOW', 'JOKER'];
  const numbers = Array.from({ length: 13 }, (_, i) => i + 1);

  const handleTileClick = (color: TileColor, value: number) => {
    if (mode === 'add') {
      const added = addTile({ color, value });
      if (!added) {
        alert(t('alertRackFull'));
      }
    } else {
      if (color === 'JOKER') {
        alert(t('alertJokerIndicator'));
        return;
      }
      setOkeyMeta({ color, value });
      setMode('add'); // Switch back to add mode
    }
  };

  const getBgColor = (color: TileColor) => {
    switch (color) {
      case 'RED': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'BLACK': return 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700';
      case 'BLUE': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'YELLOW': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'JOKER': return 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-card-bg border border-card-border p-6 backdrop-blur-md shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{t('manualTilePicker')}</h2>
          <p className="text-xs text-text-secondary">{t('pickerDesc')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'add'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                : 'bg-btn-sec-bg text-btn-sec-text hover:bg-btn-sec-hover'
            }`}
          >
            {t('addToRack')}
          </button>
          <button
            onClick={() => setMode('indicator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'indicator'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-600/30'
                : 'bg-btn-sec-bg text-btn-sec-text hover:bg-btn-sec-hover'
            }`}
          >
            {t('setIndicator')}
          </button>
          <button
            onClick={clearRack}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-900/50 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            {t('clearRack')}
          </button>
        </div>
      </div>

      {/* Mode Indicator Banner */}
      {mode === 'indicator' && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex justify-between items-center animate-slide-down">
          <span>{t('indicatorBanner')}</span>
          <button onClick={() => setMode('add')} className="underline hover:text-emerald-500 cursor-pointer">{t('cancel')}</button>
        </div>
      )}

      {/* Selector Interface */}
      <div className="flex flex-col gap-5">
        {/* Colors Select Row */}
        <div className="flex flex-wrap gap-2.5">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${getBgColor(color)} ${
                selectedColor === color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-bg-primary scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {color}
            </button>
          ))}
        </div>

        {/* Numbers/Values Grid */}
        <div className="bg-panel-bg p-4 rounded-xl border border-panel-border">
          {selectedColor === 'JOKER' ? (
            <div className="flex flex-col items-center justify-center p-6 gap-3">
              <button
                onClick={() => handleTileClick('JOKER', 0)}
                className="w-16 h-24 rounded-xl font-extrabold text-3xl flex items-center justify-center border-t border-b-4 border-x border-rose-300 bg-radial from-amber-50 to-amber-100 text-rose-600 shadow-lg hover:scale-105 transition-transform cursor-pointer"
              >
                ★
              </button>
              <span className="text-xs text-text-secondary">{t('spawnJoker')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-13 gap-2">
              {numbers.map((num) => {
                // Mock a tile to display inside button
                const mockTile: TileType = { id: `mock-${num}`, color: selectedColor, value: num };
                return (
                  <button
                    key={num}
                    onClick={() => handleTileClick(selectedColor, num)}
                    className="flex justify-center hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Tile tile={mockTile} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Okey Meta Display */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-panel-bg border border-panel-border">
          <div className="text-text-secondary text-xs">
            <span className="block font-bold text-text-primary">{t('indicatorTile')}</span>
            {okeyMeta ? t('indicatorActive') : t('indicatorNotSet')}
          </div>
          <div className="ml-auto">
            {okeyMeta ? (
              <div className="flex items-center gap-2">
                <Tile tile={{ id: 'indicator', ...okeyMeta }} isIndicator />
                <button
                  onClick={() => setOkeyMeta(null)}
                  className="p-1.5 rounded bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text border border-card-border hover:text-text-primary text-xs cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="w-11 h-16 rounded-lg border-2 border-dashed border-panel-border flex items-center justify-center text-text-tertiary text-xs font-bold bg-input-bg">
                {t('none')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TilePool;
