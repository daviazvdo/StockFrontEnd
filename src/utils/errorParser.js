/**
 * Pega o erro que veio do axios e devolve só a mensagem
 * que a gente quer mostrar na tela pro usuário.
 *
 * A nossa API sempre responde erro nesse formato:
 * { error: { code, message } }
 */
export function getErrorMessage(error) {
  // Erro de conexão (backend fora do ar, sem internet, etc)
  if (error.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
  }

  // A API respondeu, mas com um erro (400, 401, 404, etc)
  if (error.response && error.response.data) {
    if (error.response.data.error && typeof error.response.data.error.message === 'string') {
      return error.response.data.error.message;
    }
    if (typeof error.response.data.error === 'string') {
      return error.response.data.error;
    }
    if (typeof error.response.data.message === 'string') {
      return error.response.data.message;
    }
  }

  if (error.message && error.message.includes('timeout')) {
    return 'Tempo limite de resposta esgotado. Verifique a conexão com o servidor.';
  }

  // Qualquer outro erro que a gente não previu
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
}

export default getErrorMessage;
