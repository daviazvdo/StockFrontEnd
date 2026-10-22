import axios from 'axios';

// Endereço do backend. Pode ser trocado no arquivo .env (VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Antes de cada requisição, se tiver um token salvo, manda ele no header.
// É assim que o backend sabe que estamos logados.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('keepstock_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se a API responder 401 (não autorizado), o token não é mais válido.
// Então limpamos o login e mandamos o usuário de volta pra tela de login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Se deu 401 e não foi a própria tentativa de login (senha errada, por
    // exemplo), é porque o token expirou. Aí sim limpamos e mandamos pro login.
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('keepstock_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
