// Configuración del backend
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    USERS: '/users',
    EVENTS: '/events',
    BETS: '/bets',
    USER_BETS: '/bets/user',
    BET_OPTIONS: '/bet-options/event'
  }
};

// Headers por defecto para las peticiones
export const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // En el cliente, intentar obtener token de localStorage como fallback
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Función helper para hacer fetch con headers de auth
export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  return fetch(url, defaultOptions);
};
