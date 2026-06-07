// API base URL — resolves in this order:
// 1. Explicit VITE_API_URL env var (set at Render build time)
// 2. Auto-detect: if running on the frontend domain, use the backend domain
// 3. Empty string = relative URL (works via Vite proxy in local dev)

const getAPI = () => {
  // Injected at build time by Vite
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Runtime detection for production deployment
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If running on Render frontend, point to Render backend
    if (host.includes('onrender.com') || host.includes('noveltea-frontend')) {
      return 'https://noveltea.onrender.com';
    }
  }

  // Local dev — Vite proxy handles /api → localhost:5000
  return '';
};

const API = getAPI();

export default API;
