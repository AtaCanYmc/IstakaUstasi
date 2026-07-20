import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import Board from '../components/Board';
import TilePool from '../components/TilePool';
import VisionUpload from '../components/VisionUpload';
import AuthModal from '../components/AuthModal';
import Tile from '../components/Tile';
import { Play, RotateCcw, LogOut, LogIn, Info, Sparkles, Sun, Moon, Globe, Settings, Trash2, Key } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user,
    token,
    initializeAuth,
    logout,
    roboflowKeyConfig,
    saveRoboflowKeyConfig,
    deleteRoboflowKeyConfig,
    strategy,
    setStrategy,
    allowOneAfter,
    setAllowOneAfter,
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
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [customApiKey, setCustomApiKey] = useState('');
  const [customWorkspace, setCustomWorkspace] = useState('');
  const [customWorkflowId, setCustomWorkflowId] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');

  useEffect(() => {
    if (roboflowKeyConfig) {
      // Don't pre-populate masked values for input changes to avoid saving "xxxx...xxxx" literally
      setCustomApiKey(roboflowKeyConfig.has_key ? '••••••••••••••••' : '');
      setCustomWorkspace(roboflowKeyConfig.workspace || '');
      setCustomWorkflowId(roboflowKeyConfig.workflow_id || '');
      setCustomApiUrl(roboflowKeyConfig.api_url || '');
    }
  }, [roboflowKeyConfig]);

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
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text text-[10px] sm:text-xs font-bold transition-all border border-card-border cursor-pointer"
            >
              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="uppercase">{language}</span>
            </button>
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 mt-1 bg-card-bg border border-card-border rounded-xl shadow-xl py-1 z-50 min-w-[100px]">
                  {(['tr', 'en', 'fr', 'de'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-bg-secondary cursor-pointer ${
                        language === lang ? 'text-indigo-600 dark:text-indigo-400' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Deutsch'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text transition-all border border-card-border cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
          </button>

          {token && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text transition-all border border-card-border cursor-pointer relative"
              title={t('roboflowSettings')}
            >
              <Settings className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              {roboflowKeyConfig?.has_key && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          )}

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
                className="p-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                title={t('signIn')}
              >
                <LogIn className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">{t('signIn')}</span>
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
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border bg-bg-secondary text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none">
                <input
                  type="checkbox"
                  checked={allowOneAfter}
                  onChange={(e) => setAllowOneAfter(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-card-border text-indigo-600 bg-bg-primary focus:ring-indigo-500 cursor-pointer"
                />
                <span>{t('allowOneAfter')}</span>
              </label>
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
          </div>

          <Board />
          {solverResult && (
            <div className="mt-4 flex items-center justify-between px-5 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs shadow-sm max-w-xs ml-auto">
              <span className="text-text-secondary font-medium">{t('meldsScore')}:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{solverResult.totalScore}</span>
            </div>
          )}
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-card-bg border border-card-border p-6 shadow-2xl space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" />
                {t('roboflowSettings')}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {t('roboflowSettingsDesc')}
              </p>
            </div>

            {roboflowKeyConfig?.has_key && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('customKeyActive')}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('apiKey')}</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Paste your Roboflow private api key..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('workspace')}</label>
                <input
                  type="text"
                  value={customWorkspace}
                  onChange={(e) => setCustomWorkspace(e.target.value)}
                  placeholder="ata-dc7ry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('workflowId')}</label>
                <input
                  type="text"
                  value={customWorkflowId}
                  onChange={(e) => setCustomWorkflowId(e.target.value)}
                  placeholder="okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('apiUrl')}</label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://serverless.roboflow.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-card-border pt-4">
              {roboflowKeyConfig?.has_key && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to remove your custom key configurations?')) {
                      try {
                        await deleteRoboflowKeyConfig();
                        setIsSettingsOpen(false);
                      } catch {
                        alert('Failed to remove custom key config');
                      }
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('remove')}
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    const keyToSend = customApiKey === '••••••••••••••••' ? '' : customApiKey;
                    if (!roboflowKeyConfig?.has_key && !customApiKey) {
                      alert('Please enter a valid API Key');
                      return;
                    }
                    await saveRoboflowKeyConfig(
                      keyToSend,
                      customWorkspace || undefined,
                      customWorkflowId || undefined,
                      customApiUrl || undefined
                    );
                    setIsSettingsOpen(false);
                  } catch {
                    alert('Failed to save Roboflow key configuration');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
