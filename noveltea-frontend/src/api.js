// Central API base URL.
// In development: Vite proxy forwards /api → http://localhost:5000
// In Docker/production: Nginx proxy forwards /api → backend container
// Empty string = relative URL (works in both cases after the proxy is set up)
const API = import.meta.env.VITE_API_URL || '';

export default API;
