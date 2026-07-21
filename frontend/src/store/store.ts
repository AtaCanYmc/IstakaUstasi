import { create } from 'zustand';
import apiService, { registerUnauthorizedCallback } from '../services/api';
import type { Tile, OkeyMeta, Arrangement, UserProfile, TileColor, RoboflowKeyResponse } from '../services/api';
import { translations, type Language } from '../i18n/translations';

interface SolverState {
  // Theme and Localization
  language: Language;
  theme: 'light' | 'dark';
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Auth
  user: UserProfile | null;
  token: string | null;
  isLoggingIn: boolean;
  authError: string | null;

  // Roboflow Key Config
  roboflowKeyConfig: RoboflowKeyResponse | null;
  fetchRoboflowKeyConfig: () => Promise<void>;
  saveRoboflowKeyConfig: (key: string, workspace?: string, workflowId?: string, apiUrl?: string) => Promise<void>;
  deleteRoboflowKeyConfig: () => Promise<void>;
  updateUserProfile: (username: string) => Promise<void>;

  // Rack Grid (2 rows of 20 slots = 40 slots)
  rack: (Tile | null)[];
  okeyMeta: OkeyMeta | null;
  strategy: 'backtracking' | 'greedy' | 'ilp' | 'hybrid' | 'beam' | 'genetic' | 'annealing' | 'mcts';
  allowOneAfter: boolean;
  isSolving: boolean;
  solveError: string | null;
  solverResult: Arrangement | null;

  // Vision
  isProcessingVision: boolean;
  visionError: string | null;
  visionConfigured: boolean;
  isBackendWaking: boolean;
  isBackendReady: boolean;

  // Setters & Actions
  initBackendCheck: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  initializeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;

  // Rack actions
  setRack: (rack: (Tile | null)[]) => void;
  clearRack: () => void;
  generateRandomHand: () => void;
  addTile: (tile: Omit<Tile, 'id'>) => boolean;
  removeTile: (index: number) => void;
  moveTile: (fromIndex: number, toIndex: number) => void;
  setOkeyMeta: (meta: OkeyMeta | null) => void;
  setStrategy: (strategy: 'backtracking' | 'greedy' | 'ilp' | 'hybrid' | 'beam' | 'genetic' | 'annealing' | 'mcts') => void;
  setAllowOneAfter: (allow: boolean) => void;

  // Solver
  solve: () => Promise<void>;
  applyArrangement: (arrangement: Arrangement) => void;

  // Vision
  uploadImageExtract: (file: File) => Promise<void>;
  uploadImageSolve: (file: File) => Promise<void>;
  checkHealth: () => Promise<void>;
}

const RACK_SIZE = 40;

export const useStore = create<SolverState>((set, get) => ({
  // Theme and Localization
  language: 'tr',
  theme: 'dark',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
  },
  t: (key, params) => {
    const lang = get().language;
    const dict = translations[lang] || translations['tr'];
    const translation = dict[key as keyof typeof translations['tr']];
    if (!translation) return key;
    if (params) {
      let result = translation;
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
      return result;
    }
    return translation;
  },

  user: null,
  token: null,
  isLoggingIn: false,
  authError: null,

  roboflowKeyConfig: null,

  fetchRoboflowKeyConfig: async () => {
    if (!get().token) return;
    try {
      const config = await apiService.getRoboflowKey();
      set({ roboflowKeyConfig: config });
    } catch {}
  },

  saveRoboflowKeyConfig: async (key, workspace, workflowId, apiUrl) => {
    try {
      const config = await apiService.saveRoboflowKey(key, workspace, workflowId, apiUrl);
      set({ roboflowKeyConfig: config });
    } catch (err) {
      throw err;
    }
  },

  deleteRoboflowKeyConfig: async () => {
    try {
      await apiService.deleteRoboflowKey();
      set({ roboflowKeyConfig: { has_key: false } });
    } catch (err) {
      throw err;
    }
  },

  updateUserProfile: async (username) => {
    try {
      const profile = await apiService.updateProfile(username);
      set({ user: profile });
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      throw err;
    }
  },

  rack: Array(RACK_SIZE).fill(null),
  okeyMeta: null,
  strategy: 'backtracking',
  allowOneAfter: true,
  isSolving: false,
  solveError: null,
  solverResult: null,

  isProcessingVision: false,
  visionError: null,
  visionConfigured: false,
  isBackendWaking: false,
  isBackendReady: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  initializeAuth: () => {
    // Load language preference
    const savedLang = localStorage.getItem('language') as Language;
    const browserLang = navigator.language.split('-')[0] as Language;
    const initialLang = savedLang || (['tr', 'en', 'fr', 'de'].includes(browserLang) ? browserLang : 'tr');

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    set({ language: initialLang, theme: initialTheme });

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) });
        get().fetchRoboflowKeyConfig();
        // Sync user details in background
        apiService.syncUser()
          .then((res) => {
            set({ user: res.profile });
            localStorage.setItem('user', JSON.stringify(res.profile));
          })
          .catch((err) => {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              get().logout();
            }
          });
      } catch {
        // Clear corrupt state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await apiService.login(email, password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      set({ token: res.access_token, user: res.user, isLoggingIn: false });
      get().fetchRoboflowKeyConfig();
    } catch (err: any) {
      set({
        authError: err.response?.data?.detail || 'Login failed. Please check your credentials.',
        isLoggingIn: false,
      });
      throw err;
    }
  },

  signup: async (email, username, password) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await apiService.signup(email, username, password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      set({ token: res.access_token, user: res.user, isLoggingIn: false });
      get().fetchRoboflowKeyConfig();
    } catch (err: any) {
      set({
        authError: err.response?.data?.detail || 'Signup failed. Please try again.',
        isLoggingIn: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, roboflowKeyConfig: null });
  },

  setRack: (rack) => set({ rack }),

  clearRack: () => set({ rack: Array(RACK_SIZE).fill(null), solverResult: null }),

  generateRandomHand: () => {
    const colors: TileColor[] = ['RED', 'BLACK', 'BLUE', 'YELLOW'];
    const newRack: (Tile | null)[] = Array(RACK_SIZE).fill(null);

    for (let i = 0; i < 14; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomVal = Math.floor(Math.random() * 13) + 1;
      newRack[i] = {
        id: `${randomColor.toLowerCase()}_${randomVal}_${Math.random().toString(36).substring(2, 9)}`,
        color: randomColor,
        value: randomVal,
      };
    }
    set({ rack: newRack, solverResult: null });
  },

  addTile: (tile) => {
    const rack = [...get().rack];
    const emptyIndex = rack.findIndex((t) => t === null);
    if (emptyIndex === -1) {
      return false; // Rack is full
    }
    rack[emptyIndex] = {
      ...tile,
      id: `${tile.color.toLowerCase()}_${tile.value}_${Math.random().toString(36).substr(2, 9)}`,
    };
    set({ rack });
    return true;
  },

  removeTile: (index) => {
    const rack = [...get().rack];
    rack[index] = null;
    set({ rack });
  },

  moveTile: (fromIndex, toIndex) => {
    const rack = [...get().rack];
    const [moved] = rack.splice(fromIndex, 1);
    // Put null back in fromIndex to keep the length
    rack.splice(fromIndex, 0, null);
    // Overwrite the slot at toIndex
    rack[toIndex] = moved;
    set({ rack });
  },

  setOkeyMeta: (okeyMeta) => set({ okeyMeta }),

  setStrategy: (strategy) => set({ strategy }),

  setAllowOneAfter: (allowOneAfter) => set({ allowOneAfter }),

  solve: async () => {
    const activeTiles = get().rack.filter((t): t is Tile => t !== null);
    if (activeTiles.length === 0) {
      set({ solveError: get().t('alertRackEmpty') });
      return;
    }
    set({ isSolving: true, solveError: null });
    try {
      const arrangement = await apiService.arrangeHand(activeTiles, get().okeyMeta, get().strategy, get().allowOneAfter);
      set({ solverResult: arrangement, isSolving: false });
      get().applyArrangement(arrangement);
    } catch (err: any) {
      const msg = err.response?.data?.detail || get().t('alertSolverError');
      set({ solveError: msg, isSolving: false });
    }
  },

  applyArrangement: (arrangement) => {
    // Lay out melds and remaining tiles visually onto a 2-row x 20-col rack
    const newRack: (Tile | null)[] = Array(RACK_SIZE).fill(null);
    let currentIdx = 0;

    // Place each meld on the rack with an empty space between them
    arrangement.melds.forEach((meld) => {
      // Check if this meld fits in the current row (first row ends at 19, second at 39)
      const meldLength = meld.tiles.length;

      // If it would cross row boundaries, wrap to the next row (if we are on the first row)
      if (currentIdx < 20 && currentIdx + meldLength > 20) {
        currentIdx = 20; // wrap to 2nd row
      }

      // Check if we still have space
      if (currentIdx + meldLength <= RACK_SIZE) {
        meld.tiles.forEach((tile) => {
          newRack[currentIdx++] = tile;
        });
        // Leave a space after the meld if it doesn't end the row
        if (currentIdx < 20 || (currentIdx > 20 && currentIdx < 40)) {
          currentIdx++; // skip one space
        }
      }
    });

    // Move to next row or skip a slot before remaining tiles if they exist
    if (arrangement.remainingTiles.length > 0) {
      if (currentIdx < 20) {
        currentIdx = 20; // Put remaining tiles on the second row
      } else {
        // Just leave some space if we are already on the second row
        if (currentIdx < 40) currentIdx++;
      }

      arrangement.remainingTiles.forEach((tile) => {
        if (currentIdx < RACK_SIZE) {
          newRack[currentIdx++] = tile;
        }
      });
    }

    set({ rack: newRack });
  },

  uploadImageExtract: async (file) => {
    set({ isProcessingVision: true, visionError: null });
    try {
      const jobResponse = await apiService.extractTiles(file);

      // Poll job status
      const pollJob = async (jobId: string, intervalMs = 1000, timeoutMs = 60000): Promise<any> => {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
          const job = await apiService.getJobStatus(jobId);
          if (job.status === 'completed') {
            return job.result;
          }
          if (job.status === 'failed') {
            throw new Error(job.error || 'Job failed processing on the server.');
          }
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        throw new Error('Processing timed out on the server.');
      };

      const res = await pollJob(jobResponse.job_id);

      // Place extracted tiles on the board
      const newRack = Array(RACK_SIZE).fill(null);
      res.tiles.forEach((tile: any, index: number) => {
        if (index < RACK_SIZE) {
          newRack[index] = tile;
        }
      });
      set({ rack: newRack, isProcessingVision: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to extract tiles from image.';
      set({ visionError: msg, isProcessingVision: false });
      throw err;
    }
  },

  uploadImageSolve: async (file) => {
    set({ isProcessingVision: true, visionError: null });
    try {
      const jobResponse = await apiService.solveVision(
        file,
        get().okeyMeta,
        get().strategy,
        get().allowOneAfter
      );

      // Poll job status
      const pollJob = async (jobId: string, intervalMs = 1000, timeoutMs = 60000): Promise<any> => {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
          const job = await apiService.getJobStatus(jobId);
          if (job.status === 'completed') {
            return job.result;
          }
          if (job.status === 'failed') {
            throw new Error(job.error || 'Job failed processing on the server.');
          }
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        throw new Error('Processing timed out on the server.');
      };

      const res = await pollJob(jobResponse.job_id);

      if (res.arrangement) {
        set({ solverResult: res.arrangement });
        get().applyArrangement(res.arrangement);
      } else {
        // Place just the tiles on the board
        const newRack = Array(RACK_SIZE).fill(null);
        res.tiles.forEach((tile: any, index: number) => {
          if (index < RACK_SIZE) {
            newRack[index] = tile;
          }
        });
        set({ rack: newRack });
      }
      set({ isProcessingVision: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to solve hand from image.';
      set({ visionError: msg, isProcessingVision: false });
      throw err;
    }
  },

  initBackendCheck: async () => {
    if (get().isBackendReady) return;

    let wakingTimeout = setTimeout(() => {
      set({ isBackendWaking: true });
    }, 1500);

    const poll = async () => {
      try {
        const data = await apiService.getHealth();
        clearTimeout(wakingTimeout);
        set({
          isBackendWaking: false,
          isBackendReady: true,
          visionConfigured: data.vision_configured
        });
      } catch (err) {
        setTimeout(poll, 3000);
      }
    };

    await poll();
  },

  checkHealth: async () => {
    try {
      const data = await apiService.getHealth();
      set({ visionConfigured: data.vision_configured, isBackendReady: true });
    } catch (err) {}
  }
}));

// Automatically log out user if any API call responds with 401 or 403
registerUnauthorizedCallback(() => {
  useStore.getState().logout();
});
