import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Plus, Filter, Pencil, Trash2, X } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

export function ProdutosPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'GERENTE']);
  const canDelete = hasRole(['ADMIN']);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  const [produtos, setProdutos] = useState([
    { id: 1, codigo: 'PROD-001', nome: 'Sensor Fotoelétrico Industrial 24V', categoria: 'Sensores', estoque: 84, estoque_minimo: 20, preco: 189.90 },
    { id: 2, codigo: 'PROD-002', nome: 'Controlador Lógico Programável (CLP)', categoria: 'Automação', estoque: 6, estoque_minimo: 10, preco: 1250.00 },
    { id: 3, codigo: 'PROD-003', nome: 'Fonte Chaveada Trilho DIN 24V 10A', categoria: 'Elétrica', estoque: 35, estoque_minimo: 15, preco: 215.50 },
    { id: 4, codigo: 'PROD-004', nome: 'Cabo Blindado 4 Vias 100 Metros', categoria: 'Cabos', estoque: 18, estoque_minimo: 10, preco: 380.00 },
    { id: 5, codigo: 'PROD-005', nome: 'Relé de Estado Sólido 40A 220V', categoria: 'Elétrica', estoque: 3, estoque_minimo: 15, preco: 74.20 },
    { id: 6, codigo: 'PROD-006', nome: 'Conector M12 Macho 4 Pinos IP67', categoria: 'Conectores', estoque: 150, estoque_minimo: 40, preco: 32.00 },
  ]);

  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    nome: '', codigo: '', categoria_id: '', fornecedor_id: '', preco: '', estoque_minimo: '', descricao: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [prods, cats, forns] = await Promise.all([
        inventoryService.getProdutos(),
        inventoryService.getCategorias(),
        inventoryService.getFornecedores(),
      ]);

      const prodArray = prods?.data || prods;
      if (prodArray && Array.isArray(prodArray) && prodArray.length > 0) setProdutos(prodArray);

      const catArray = cats?.data || cats;
      if (catArray && Array.isArray(catArray)) setCategorias(catArray);

      const fornArray = forns?.data || forns;
      if (fornArray && Array.isArray(fornArray)) setFornecedores(fornArray);
    }
    fetchData();
  }, []);

  function openCreate() {
    setEditingProduto(null);
    setFormData({ nome: '', codigo: '', categoria_id: '', fornecedor_id: '', preco: '', estoque_minimo: '', descricao: '' });
    setFormError('');
    setShowModal(true);
  }

  function openEdit(produto) {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome || '',
      codigo: produto.codigo || produto.sku || '',
      categoria_id: produto.categoria_id || '',
      fornecedor_id: produto.fornecedor_id || '',
      preco: produto.preco || '',
      estoque_minimo: produto.estoque_minimo || produto.estoqueMinimo || '',
      descricao: produto.descricao || '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!formData.nome.trim()) return setFormError('Nome é obrigatório.');
    if (!formData.codigo.trim()) return setFormError('Código (SKU) é obrigatório.');
    if (!editingProduto && !formData.categoria_id) return setFormError('Selecione uma categoria.');
    if (!editingProduto && !formData.fornecedor_id) return setFormError('Selecione um fornecedor.');

    const payload = {
      nome: formData.nome.trim(),
      codigo: formData.codigo.trim(),
      ...(formData.categoria_id && { categoria_id: Number(formData.categoria_id) }),
      ...(formData.fornecedor_id && { fornecedor_id: Number(formData.fornecedor_id) }),
      ...(formData.preco !== '' && { preco: Number(formData.preco) }),
      ...(formData.estoque_minimo !== '' && { estoque_minimo: Number(formData.estoque_minimo) }),
      ...(formData.descricao && { descricao: formData.descricao.trim() }),
    };

    setIsSubmitting(true);
    try {
      if (editingProduto) {
        const res = await inventoryService.updateProduto(editingProduto.id, payload);
        const updated = res?.produto || { ...editingProduto, ...payload };
        setProdutos((prev) => prev.map((p) => (p.id === editingProduto.id ? updated : p)));
      } else {
        const res = await inventoryService.createProduto(payload);
        const created = res?.produto || { id: Date.now(), ...payload };
        setProdutos((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await inventoryService.deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const categoriasUnicas = [...new Set(produtos.map((p) => p.categoria).filter(Boolean))];

  const filtered = produtos.filter((p) => {
    const sku = p.codigo || p.sku || '';
    const cat = p.categoria || '';
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TODAS' || cat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (p) => {
    const estoque = p.estoque ?? 0;
    const minimo = p.estoque_minimo || p.estoqueMinimo || 0;
    if (estoque <= 0) return { status: 'danger', label: 'Esgotado' };
    if (estoque <= minimo) return { status: 'warning', label: 'Estoque Baixo' };
    return { status: 'success', label: 'Normal' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Catálogo de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualização e controle de itens estocados no armazém.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Novo Produto
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por nome ou SKU..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="TODAS">Todas as Categorias</option>
            {categoriasUnicas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">SKU / Código</th>
                <th className="py-3 px-6 font-semibold">Descrição do Produto</th>
                <th className="py-3 px-6 font-semibold">Categoria</th>
                <th className="py-3 px-6 font-semibold text-center">Em Estoque</th>
                <th className="py-3 px-6 font-semibold text-right">Preço Unitário</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
                {canManage && <th className="py-3 px-6 font-semibold text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((item) => {
                const stock = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-bold">
                      {item.codigo || item.sku || '—'}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-100">{item.nome}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="bg-[#141e3a] px-2.5 py-1 rounded-lg border border-[#1e2c54]">
                        {item.categoria || item.categoria_nome || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-white">
                      {item.estoque ?? '—'} un
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-200">
                      {item.preco != null ? `R$ ${Number(item.preco).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={stock.status} label={stock.label} />
                    </td>
                    {canManage && (
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(item)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="py-12 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Nome do Produto *"
                    placeholder="Ex: Sensor Fotoelétrico 24V"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Código / SKU *"
                  placeholder="Ex: PROD-001"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
                <Input
                  label="Preço Unitário (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Categoria {!editingProduto && <span className="text-rose-400">*</span>}
                </label>
                {categorias.length > 0 ? (
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full bg-[#10172a] border border-[#1e294b] text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="ID da categoria"
                    type="number"
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  />
                )}
              </div>

              {/* Fornecedor */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Fornecedor {!editingProduto && <span className="text-rose-400">*</span>}
                </label>
                {fornecedores.length > 0 ? (
                  <select
                    value={formData.fornecedor_id}
                    onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                    className="w-full bg-[#10172a] border border-[#1e294b] text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="ID do fornecedor"
                    type="number"
                    value={formData.fornecedor_id}
                    onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                  />
                )}
              </div>

              <Input
                label="Estoque Mínimo"
                type="number"
                min="0"
                placeholder="Ex: 10"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
              />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : editingProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Excluir Produto</h3>
            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja excluir <span className="text-white font-semibold">{showDeleteConfirm.nome}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(null)}>
                Cancelar
              </Button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProdutosPage;
