/**
 * useAuth Hook
 *
 * Manages authentication state using zustand.
 * Handles domain-based login flow:
 * - College email → COLLEGE_USER with campus access
 * - Other email → PUBLIC_USER with global-only access
 *
 * Persists token to sessionStorage for tab-level persistence.
 */

import { create } from 'zustand';

const API_BASE = 'http://localhost:8080/api/auth';

export type UserRole = 'COLLEGE_USER' | 'PUBLIC_USER';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  collegeId: string | null;
  collegeName: string | null;
  anonymousName: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please try again.');
      }

      const data = await response.json();

      const user: AuthUser = {
        userId: data.userId,
        email: data.email,
        role: data.role,
        collegeId: data.collegeId,
        collegeName: data.collegeName,
        anonymousName: data.anonymousName,
      };

      // Persist token for tab session
      sessionStorage.setItem('saarthi_token', data.token);

      set({
        user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
    }
  },

  logout: async () => {
    const { token } = get();

    try {
      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch {
      // Silent fail on logout API error
    }

    sessionStorage.removeItem('saarthi_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  restoreSession: async () => {
    const savedToken = sessionStorage.getItem('saarthi_token');
    if (!savedToken) return;

    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE}/me`, {
        headers: { 'Authorization': `Bearer ${savedToken}` },
      });

      if (!response.ok) {
        sessionStorage.removeItem('saarthi_token');
        set({ isLoading: false });
        return;
      }

      const data = await response.json();

      set({
        user: {
          userId: data.userId,
          email: data.email,
          role: data.role,
          collegeId: data.collegeId,
          collegeName: data.collegeName,
          anonymousName: data.anonymousName,
        },
        token: savedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      sessionStorage.removeItem('saarthi_token');
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

/**
 * Helper: check if user has campus access
 */
export function hasCollegeAccess(user: AuthUser | null): boolean {
  return user?.role === 'COLLEGE_USER' && user.collegeId != null;
}
