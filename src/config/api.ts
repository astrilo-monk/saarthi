/**
 * API Configuration
 *
 * Uses environment variable for production (Vercel sets this at build time).
 * Falls back to localhost for local development.
 */

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080/api';

export const API = {
  CHAT: `${API_BASE_URL}/chat`,
  AUTH: `${API_BASE_URL}/auth`,
  FORUM: `${API_BASE_URL}/forum`,
} as const;

export default API;
