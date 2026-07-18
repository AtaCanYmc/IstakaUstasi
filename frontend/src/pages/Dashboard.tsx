import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import Board from '../components/Board';
import TilePool from '../components/TilePool';
import VisionUpload from '../components/VisionUpload';
import AuthModal from '../components/AuthModal';
import Tile from '../components/Tile';
import { Play, RotateCcw, LogOut, Info, Sparkles } from 'lucide-react';

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
  } = useStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20">
            🀄
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Istaka Ustası
            </h1>
            <p className="text-[10px] text-indigo-400 font-medium">Okey Solver & Vision Assistant</p>
          </div>
        </div>

        {/* User profile / Login */}
        <div className="flex items-center gap-4">
          {token && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-slate-200">{user.username}</span>
                <span className="block text-[10px] text-slate-400">{user.email}</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-xs text-indigo-300">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Arrange your Okey rack automatically!
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Add tiles using the visual selector, drag & drop tiles to manually adjust, or sign in to upload photos of your real physical board.
            </p>
          </div>
        </div>

        {/* Board / Rack section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider">Your Rack</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {(['backtracking', 'greedy', 'ilp', 'hybrid'] as const).map((strat) => (
                  <button
                    key={strat}
                    onClick={() => setStrategy(strat)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                      strategy === strat
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
              </div>
              <button
                onClick={clearRack}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200"
                title="Reset rack"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={solve}
                disabled={isSolving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isSolving ? 'Solving...' : 'Arrange Melds'}
              </button>
            </div>
          </div>

          <Board />
        </section>

        {solveError && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 text-sm flex gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{solveError}</span>
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
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-md font-bold text-slate-100">Solver Output Summary</h3>
                <p className="text-xs text-slate-400">Best tile configuration found by the engine</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Meld Groups</span>
                  <span className="text-lg font-black text-emerald-400">{solverResult.melds.length}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Melds Score</span>
                  <span className="text-lg font-black text-indigo-400">{solverResult.totalScore}</span>
                </div>
              </div>
            </div>

            {/* Melds Listing */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Detected Melds</h4>
              {solverResult.melds.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No valid meld arrangements found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solverResult.melds.map((meld, mIdx) => (
                    <div key={mIdx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          meld.type === 'SERI'
                            ? 'bg-blue-950/50 text-blue-400 border border-blue-900/40'
                            : meld.type === 'PER'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                            : 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/40'
                        }`}>
                          {meld.type === 'SERI' ? 'Run (Seri)' : meld.type === 'PER' ? 'Group (Per)' : 'Double (Çift)'}
                        </span>
                        <span className="text-xs font-bold text-slate-400">Score: {meld.score}</span>
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
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Unarranged / Remaining Tiles</h4>
                <div className="flex gap-2.5 flex-wrap bg-slate-950/20 p-4 rounded-xl border border-slate-800/50">
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
