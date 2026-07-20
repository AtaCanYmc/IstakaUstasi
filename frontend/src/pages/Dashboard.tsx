import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import Board from '../components/Board';
import TilePool from '../components/TilePool';
import VisionUpload from '../components/VisionUpload';
import AuthModal from '../components/AuthModal';
import SettingsModal from '../components/SettingsModal';
import Header from '../components/Header';
import WorkspaceBanner from '../components/WorkspaceBanner';
import RackControls from '../components/RackControls';
import SolverResults from '../components/SolverResults';
import { Info } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    initializeAuth,
    solveError,
    solverResult,
    checkHealth,
    t,
  } = useStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary pb-20 safe-pb safe-pt safe-pl safe-pr text-text-primary selection:bg-indigo-500 selection:text-white">
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <WorkspaceBanner />

        {/* Rack section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-md font-bold text-text-secondary uppercase tracking-wider">
              {t('yourRack')}
            </h2>
            <RackControls />
          </div>

          <Board />

          {solverResult && (
            <div className="mt-4 flex items-center justify-between px-5 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs shadow-sm max-w-xs ml-auto">
              <span className="text-text-secondary font-medium">{t('meldsScore')}:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {solverResult.totalScore}
              </span>
            </div>
          )}
        </section>

        {solveError && (
          <div className="p-4 rounded-xl bg-rose-950/20 dark:bg-rose-950/40 border border-rose-500/20 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 text-sm flex gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{t(solveError)}</span>
          </div>
        )}

        {/* Tools grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TilePool />
          <VisionUpload />
        </div>

        <SolverResults />
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;
