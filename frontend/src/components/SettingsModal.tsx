import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    roboflowKeyConfig,
    saveRoboflowKeyConfig,
    deleteRoboflowKeyConfig,
    updateUserProfile,
    t,
  } = useStore();

  const [customUsername, setCustomUsername] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customWorkspace, setCustomWorkspace] = useState('');
  const [customWorkflowId, setCustomWorkflowId] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');

  useEffect(() => {
    if (user) {
      setCustomUsername(user.username || '');
    }
  }, [user]);

  useEffect(() => {
    if (roboflowKeyConfig) {
      setCustomApiKey(roboflowKeyConfig.has_key ? '••••••••••••••••' : '');
      setCustomWorkspace(roboflowKeyConfig.workspace || '');
      setCustomWorkflowId(roboflowKeyConfig.workflow_id || '');
      setCustomApiUrl(roboflowKeyConfig.api_url || '');
    }
  }, [roboflowKeyConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
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

        {/* Profile Settings Section */}
        <div className="space-y-4 pb-4 border-b border-card-border">
          <h4 className="text-xs uppercase font-bold tracking-wider text-indigo-500 flex items-center gap-1.5">
            {t('profileSettings')}
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('email')}</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary/50 text-sm text-text-tertiary cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-text-tertiary tracking-wider">{t('username')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
                <button
                  onClick={async () => {
                    if (!customUsername.trim()) {
                      alert('Username cannot be empty');
                      return;
                    }
                    try {
                      await updateUserProfile(customUsername);
                      alert(t('profileUpdated'));
                    } catch {
                      alert(t('alertProfileUpdateFailed'));
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {t('update')}
                </button>
              </div>
            </div>
          </div>
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

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-card-border bg-bg-secondary text-text-primary hover:bg-bg-secondary/80 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {roboflowKeyConfig?.has_key && (
              <button
                onClick={async () => {
                  try {
                    await deleteRoboflowKeyConfig();
                    onClose();
                  } catch (err: any) {
                    alert(err.message || 'Failed to delete key');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                {t('remove')}
              </button>
            )}
            <button
              onClick={async () => {
                if (!customApiKey) {
                  alert('API Key is required');
                  return;
                }
                try {
                  await saveRoboflowKeyConfig(
                    customApiKey,
                    customWorkspace,
                    customWorkflowId,
                    customApiUrl
                  );
                  onClose();
                } catch (err: any) {
                  alert(err.message || 'Failed to save key');
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
