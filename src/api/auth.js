import apiClient from './client';

/**
 * Serviços de Autenticação para a KStock-API
 */
export const authService = {
  /**
   * Realiza login na API
   * POST /api/v1/auth/login
   */
  async login(email, senha) {
    const response = await apiClient.post('/api/v1/auth/login', {
      email: email.trim(),
      senha,
    });
    return response.data;
  },

  /**
   * Registra novo usuário
   * POST /api/v1/auth/register
   */
  async register(nome, email, senha) {
    const response = await apiClient.post('/api/v1/auth/register', {
      nome: nome.trim(),
      email: email.trim(),
      senha,
    });
    return response.data;
  },

  /**
   * Obtém os dados do usuário autenticado a partir do JWT anexado
   * GET /api/v1/auth/me
   */
  async getMe() {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Solicita envio de e-mail com token de redefinição de senha
   * POST /api/v1/auth/esqueci-senha
   * CORREÇÃO: rota correta é /esqueci-senha (não /forgot-password)
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/api/v1/auth/esqueci-senha', {
      email: email.trim(),
    });
    return response.data;
  },

  /**
   * Confirma a redefinição de senha com o token recebido por e-mail
   * POST /api/v1/auth/resetar-senha
   * CORREÇÃO: rota correta é /resetar-senha; payload exige { token, novaSenha }
   * A API NÃO possui endpoint de verificação de código separado (fluxo é 2 etapas).
   */
  async resetPassword(token, novaSenha) {
    const response = await apiClient.post('/api/v1/auth/resetar-senha', {
      token: token.trim(),
      novaSenha,
    });
    return response.data;
  },
};

export default authService;
