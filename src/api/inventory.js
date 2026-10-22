import apiClient from './client';

/**
 * Serviços para Gestão de Inventário e Recursos do Sistema KStock-API
 */
export const inventoryService = {

  // ─────────────────────────────────────────────
  // PRODUTOS  GET /api/v1/produtos
  // ─────────────────────────────────────────────

  async getProdutos(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/produtos', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getProdutoById(id) {
    const res = await apiClient.get(`/api/v1/produtos/${id}`);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. Campos obrigatórios: categoria_id, fornecedor_id, nome, codigo */
  async createProduto(data) {
    const res = await apiClient.post('/api/v1/produtos', data);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. */
  async updateProduto(id, data) {
    const res = await apiClient.put(`/api/v1/produtos/${id}`, data);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. Envia multipart/form-data com campo "foto". */
  async uploadFotoProduto(id, file) {
    const formData = new FormData();
    formData.append('foto', file);
    const res = await apiClient.post(`/api/v1/produtos/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Requer ADMIN. */
  async deleteProduto(id) {
    const res = await apiClient.delete(`/api/v1/produtos/${id}`);
    return res.data;
  },

  /** Produtos abaixo do estoque mínimo configurado. */
  async getAlertasEstoque() {
    try {
      const res = await apiClient.get('/api/v1/produtos/alerta-estoque');
      return res.data;
    } catch {
      return null;
    }
  },

  /** Produtos em risco de ruptura. */
  async getRiscoRuptura(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/produtos/risco-ruptura', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  /** Previsão de ruptura para um produto específico. */
  async getPrevisaoRuptura(id, params = {}) {
    try {
      const res = await apiClient.get(`/api/v1/produtos/${id}/previsao-ruptura`, { params });
      return res.data;
    } catch {
      return null;
    }
  },

  // ─────────────────────────────────────────────
  // MOVIMENTAÇÕES  GET /api/v1/movimentacoes
  // ─────────────────────────────────────────────

  async getMovimentacoes(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/movimentacoes', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getMovimentacaoById(id) {
    const res = await apiClient.get(`/api/v1/movimentacoes/${id}`);
    return res.data;
  },

  /**
   * Campos obrigatórios: produto_id (int), tipo ("ENTRADA"|"SAIDA"), quantidade (int)
   * Campo opcional: observacao (string)
   * CORREÇÃO: o frontend enviava { produto: "nome" } — a API exige { produto_id: <int> }
   */
  async createMovimentacao(data) {
    const res = await apiClient.post('/api/v1/movimentacoes', data);
    return res.data;
  },

  // ─────────────────────────────────────────────
  // CATEGORIAS  GET /api/v1/categorias
  // ─────────────────────────────────────────────

  async getCategorias(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/categorias', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getCategoriaById(id) {
    const res = await apiClient.get(`/api/v1/categorias/${id}`);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. Campos obrigatórios: nome */
  async createCategoria(data) {
    const res = await apiClient.post('/api/v1/categorias', data);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. */
  async updateCategoria(id, data) {
    const res = await apiClient.put(`/api/v1/categorias/${id}`, data);
    return res.data;
  },

  /** Requer ADMIN. */
  async deleteCategoria(id) {
    const res = await apiClient.delete(`/api/v1/categorias/${id}`);
    return res.data;
  },

  // ─────────────────────────────────────────────
  // FORNECEDORES  GET /api/v1/fornecedores
  // ─────────────────────────────────────────────

  async getFornecedores(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/fornecedores', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getFornecedorById(id) {
    const res = await apiClient.get(`/api/v1/fornecedores/${id}`);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. Campos obrigatórios: nome, cnpj */
  async createFornecedor(data) {
    const res = await apiClient.post('/api/v1/fornecedores', data);
    return res.data;
  },

  /** Requer ADMIN ou GERENTE. */
  async updateFornecedor(id, data) {
    const res = await apiClient.put(`/api/v1/fornecedores/${id}`, data);
    return res.data;
  },

  /** Requer ADMIN. */
  async deleteFornecedor(id) {
    const res = await apiClient.delete(`/api/v1/fornecedores/${id}`);
    return res.data;
  },

  // ─────────────────────────────────────────────
  // HISTÓRICO / AUDITORIA  GET /api/v1/historico
  // Requer ADMIN ou GERENTE
  // ─────────────────────────────────────────────

  async getHistorico(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/historico', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getHistoricoById(id) {
    const res = await apiClient.get(`/api/v1/historico/${id}`);
    return res.data;
  },

  // ─────────────────────────────────────────────
  // USUÁRIOS  GET /api/v1/usuarios
  // ─────────────────────────────────────────────

  /** Requer ADMIN. */
  async getUsuarios(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/usuarios', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getUsuarioById(id) {
    const res = await apiClient.get(`/api/v1/usuarios/${id}`);
    return res.data;
  },

  /** Requer ADMIN. Campos obrigatórios: nome, email, senha, perfil */
  async createUsuario(data) {
    const res = await apiClient.post('/api/v1/usuarios', data);
    return res.data;
  },

  /** Atualiza nome e/ou e-mail do usuário. */
  async updateUsuario(id, data) {
    const res = await apiClient.put(`/api/v1/usuarios/${id}`, data);
    return res.data;
  },

  /** Requer ADMIN. Atualiza apenas o perfil de acesso. */
  async updateUsuarioPerfil(id, perfil) {
    const res = await apiClient.patch(`/api/v1/usuarios/${id}/perfil`, { perfil });
    return res.data;
  },

  /** Requer ADMIN. */
  async deleteUsuario(id) {
    const res = await apiClient.delete(`/api/v1/usuarios/${id}`);
    return res.data;
  },

  // ─────────────────────────────────────────────
  // ASSINATURAS  GET /api/v1/assinaturas
  // ─────────────────────────────────────────────

  /** Retorna a assinatura do usuário logado. */
  async getMinhaAssinatura() {
    try {
      const res = await apiClient.get('/api/v1/assinaturas/minha');
      return res.data;
    } catch {
      return null;
    }
  },

  /** Requer ADMIN. */
  async getAssinaturas(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/assinaturas', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  /** Requer ADMIN. */
  async getAssinaturaById(id) {
    const res = await apiClient.get(`/api/v1/assinaturas/${id}`);
    return res.data;
  },

  /** Requer ADMIN. Campos obrigatórios: usuario_id, plano, data_inicio */
  async createAssinatura(data) {
    const res = await apiClient.post('/api/v1/assinaturas', data);
    return res.data;
  },

  /** Requer ADMIN. Campo obrigatório: status */
  async updateAssinaturaStatus(id, status) {
    const res = await apiClient.patch(`/api/v1/assinaturas/${id}/status`, { status });
    return res.data;
  },

  // ─────────────────────────────────────────────
  // DASHBOARD
  // ATENÇÃO: GET /api/v1/dashboard/resumo NÃO EXISTE na API.
  // Este método sempre retornará null até o endpoint ser criado no backend.
  // ─────────────────────────────────────────────

  async getDashboardSummary() {
    try {
      const res = await apiClient.get('/api/v1/dashboard/resumo');
      return res.data;
    } catch {
      return null;
    }
  },
};

export default inventoryService;
