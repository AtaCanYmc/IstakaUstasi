import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Globe, Sun, Moon, Settings, LogOut, LogIn } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenSettings }) => {
  const {
    user,
    token,
    logout,
    roboflowKeyConfig,
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
  } = useStore();

  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
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
            onClick={onOpenSettings}
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
              onClick={onOpenAuth}
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
  );
};

export default Header;
