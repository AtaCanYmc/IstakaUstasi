import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import Board from '../components/Board';
import TilePool from '../components/TilePool';
import VisionUpload from '../components/VisionUpload';
import AuthModal from '../components/AuthModal';
import Tile from '../components/Tile';
import { Play, RotateCcw, LogOut, Info, Sparkles, Sun, Moon, Globe } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user,
    token,
    initializeAuth,
    logout,
    strategy,
    setStrategy,
    solve,
    clearRack,
    isSolving,
    solveError,
    solverResult,
    checkHealth,
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
  } = useStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary pb-20 safe-pb safe-pt safe-pl safe-pr text-text-primary selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-header-bg/85 backdrop-blur-md border-b border-header-border px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg shadow-indigo-500/20">
            🀄
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-text-primary">
              {t('title')}
            </h1>
            <p className="hidden sm:block text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">{t('subtitle')}</p>
          </div>
        </div>

        {/* Right controls and profile group */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Controls: Language and Theme */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text text-[10px] sm:text-xs font-bold transition-all border border-card-border cursor-pointer">
              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block hover:block bg-card-bg border border-card-border rounded-xl shadow-xl py-1 z-50 min-w-[100px]">
              {(['tr', 'en', 'fr', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-bg-secondary cursor-pointer ${
                    language === lang ? 'text-indigo-600 dark:text-indigo-400' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Deutsch'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text transition-all border border-card-border cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
          </button>

          <div className="h-4 w-px bg-card-border mx-0.5 sm:mx-1" />

          {/* User profile / Login */}
          <div className="flex items-center gap-2">
            {token && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-text-primary">{user.username}</span>
                  <span className="block text-[10px] text-text-tertiary">{user.email}</span>
                </div>
                <div className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] sm:text-xs text-indigo-500 dark:text-indigo-300">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text hover:text-rose-500 transition-colors border border-card-border cursor-pointer"
                  title={t('signOut')}
                >
                  <LogOut className="w-3 sm:w-4 h-3 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                {t('signIn')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Banner */}
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

        {/* Board / Rack section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-md font-bold text-text-secondary uppercase tracking-wider">{t('yourRack')}</h2>
            <div className="flex flex-wrap items-center gap-2">
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
              <button
                onClick={clearRack}
                className="p-2 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text border border-card-border hover:text-text-primary cursor-pointer"
                title={t('resetRack')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={solve}
                disabled={isSolving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isSolving ? t('solving') : t('arrangeMelds')}
              </button>
            </div>
          </div>

          <Board />
        </section>

        {solveError && (
          <div className="p-4 rounded-xl bg-rose-950/20 dark:bg-rose-950/40 border border-rose-500/20 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 text-sm flex gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{t(solveError)}</span>
          </div>
        )}

        {/* Double Column Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Tile Selection Pool */}
          <TilePool />

          {/* Column 2: Vision Upload */}
          <VisionUpload />
        </div>

        {/* Solver Results Section */}
        {solverResult && (
          <section className="rounded-2xl border border-card-border bg-card-bg p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="text-md font-bold text-text-primary">{t('solverSummary')}</h3>
                <p className="text-xs text-text-secondary">{t('solverSummaryDesc')}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-text-tertiary">{t('meldGroups')}</span>
                  <span className="text-lg font-black text-emerald-500 dark:text-emerald-400">{solverResult.melds.length}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-text-tertiary">{t('meldsScore')}</span>
                  <span className="text-lg font-black text-indigo-500 dark:text-indigo-400">{solverResult.totalScore}</span>
                </div>
              </div>
            </div>

            {/* Melds Listing */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary">{t('detectedMelds')}</h4>
              {solverResult.melds.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">{t('noMelds')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solverResult.melds.map((meld, mIdx) => (
                    <div key={mIdx} className="p-4 rounded-xl bg-panel-bg border border-panel-border flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          meld.type === 'SERI'
                            ? 'bg-blue-950/20 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-900/40'
                            : meld.type === 'PER'
                            ? 'bg-emerald-950/20 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-900/40'
                            : 'bg-indigo-950/20 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-900/40'
                        }`}>
                          {meld.type === 'SERI' ? t('runSeri') : meld.type === 'PER' ? t('groupPer') : t('doubleCift')}
                        </span>
                        <span className="text-xs font-bold text-text-secondary">{t('score')}: {meld.score}</span>
                      </div>
                      <div className="flex gap-2.5 flex-wrap">
                        {meld.tiles.map((tile, tIdx) => (
                          <Tile key={tIdx} tile={tile} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remaining tiles */}
            {solverResult.remainingTiles.length > 0 && (
              <div className="space-y-3 border-t border-card-border pt-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary">{t('unarrangedTiles')}</h4>
                <div className="flex gap-2.5 flex-wrap bg-panel-bg p-4 rounded-xl border border-panel-border">
                  {solverResult.remainingTiles.map((tile, rIdx) => (
                    <Tile key={rIdx} tile={tile} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default Dashboard;
