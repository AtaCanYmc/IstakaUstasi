import React, { useState } from 'react';
import { useStore } from '../store/store';
import { X, Lock, Mail, User, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, isLoggingIn, authError, t } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, username, password);
      }
      onClose();
      // Reset form
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card-bg border border-card-border shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg bg-btn-sec-bg hover:bg-btn-sec-hover text-btn-sec-text hover:text-text-primary transition-colors border border-card-border cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-text-primary">{isLogin ? t('signIn') : t('createAccount')}</h2>
          <p className="text-xs text-text-secondary mt-1">
            {isLogin ? t('authDescLogin') : t('authDescRegister')}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs">
            {t(authError)}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5 animate-slide-down">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-text-tertiary" />
                {t('username')}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="okey_master"
                className="w-full px-3 py-2 rounded-xl bg-input-bg border border-input-border text-text-primary placeholder-text-tertiary/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-text-tertiary" />
              {t('email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-xl bg-input-bg border border-input-border text-text-primary placeholder-text-tertiary/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-text-tertiary" />
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-input-bg border border-input-border text-text-primary placeholder-text-tertiary/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-6"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>{isLogin ? t('signIn') : t('signUp')}</>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
            }}
            className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-semibold cursor-pointer"
          >
            {isLogin ? t('noAccount') : t('hasAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
