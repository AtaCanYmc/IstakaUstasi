import axios from 'axios';

export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';

export interface Tile {
  id: string;
  color: TileColor;
  value: number; // 1-13, 0 for fake okey/joker
}

export type MeldType = 'SERI' | 'PER' | 'CIFT' | 'INVALID';

export interface Meld {
  type: MeldType;
  tiles: Tile[];
  score: number;
}

export interface OkeyMeta {
  color: TileColor;
  value: number;
}

export interface Arrangement {
  melds: Meld[];
  remainingTiles: Tile[];
  totalScore: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  image_quota_count: number;
  solver_quota_count: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface ExtractResultCustom {
  tiles: Tile[];
  raw?: any;
}

export interface OrchestratorResult {
  tiles: Tile[];
  arrangement: Arrangement | null;
}

export interface JobResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Auth API
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/signup', { email, username, password });
    return res.data;
  },

  async syncUser(): Promise<{ message: string; profile: UserProfile }> {
    try {
      const res = await api.post('/auth/sync');
      localStorage.setItem('cached_profile', JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      const cached = localStorage.getItem('cached_profile');
      if (cached) {
        console.warn('Network error: Using cached user profile offline.');
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  // Solver API
  async arrangeHand(tiles: Tile[], okeyMeta: OkeyMeta | null, strategy: string = 'backtracking'): Promise<Arrangement> {
    const cacheKey = `offline_arrange_${JSON.stringify({ tiles, okeyMeta, strategy })}`;
    try {
      const res = await api.post<Arrangement>('/solver/arrange', {
        tiles,
        okey_meta: okeyMeta,
        strategy,
      });
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.warn('Network error: Using cached hand arrangement offline.');
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  // Vision API
  async extractTiles(file: File): Promise<JobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<JobResponse>('/vision/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async solveVision(file: File, okeyMeta: OkeyMeta | null): Promise<JobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (okeyMeta) {
      formData.append('okey_meta_color', okeyMeta.color);
      formData.append('okey_meta_value', String(okeyMeta.value));
    }
    const res = await api.post<JobResponse>('/vision/solve', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getJobStatus(jobId: string): Promise<JobResponse> {
    const res = await api.get<JobResponse>(`/vision/jobs/${jobId}`);
    return res.data;
  },

  // Health API
  async getHealth(): Promise<{ status: string; version: string; vision_configured: boolean }> {
    const res = await api.get('/health');
    return res.data;
  }
};

export default apiService;
