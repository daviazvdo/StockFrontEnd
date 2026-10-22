import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Search, FolderTree, Pencil, Trash2, X } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

export function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Sensores', descricao: 'Dispositivos fotoelétricos, indutivos e de proximidade', totalItens: 42 },
    { id: 2, nome: 'Automação', descricao: 'Controladores lógicos (CLP), IHM e módulos de expansão', totalItens: 28 },
    { id: 3, nome: 'Elétrica', descricao: 'Fontes chaveadas, disjuntores, relés e contactores', totalItens: 65 },
    { id: 4, nome: 'Cabos', descricao: 'Cabos blindados, cabos de rede e fiações industriais', totalItens: 19 },
    { id: 5, nome: 'Conectores', descricao: 'Conectores circulares M12, bornes e terminais', totalItens: 87 },
  ]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await inventoryService.getCategorias();
      const arr = data?.data || data;
      if (arr && Array.isArray(arr) && arr.length > 0) setCategorias(arr);
    }
    load();
  }, []);

  function openCreate() {
    setEditingCategoria(null);
    setFormData({ nome: '', descricao: '' });
    setFormError('');
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditingCategoria(cat);
    setFormData({ nome: cat.nome || '', descricao: cat.descricao || '' });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.nome.trim()) return setFormError('Nome da categoria é obrigatório.');

    const payload = {
      nome: formData.nome.trim(),
      ...(formData.descricao && { descricao: formData.descricao.trim() }),
    };

    setIsSubmitting(true);
    try {
      if (editingCategoria) {
        const res = await inventoryService.updateCategoria(editingCategoria.id, payload);
        const updated = res?.categoria || { ...editingCategoria, ...payload };
        setCategorias((prev) => prev.map((c) => (c.id === editingCategoria.id ? updated : c)));
      } else {
        const res = await inventoryService.createCategoria(payload);
        const created = res?.categoria || { id: Date.now(), totalItens: 0, ...payload };
        setCategorias((prev) => [...prev, created]);
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
      await inventoryService.deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const filtered = categorias.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Categorias de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Segmentação e organização do catálogo de inventário.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          Nova Categoria
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por nome ou descrição da categoria..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-[#141e3a] px-2.5 py-1 rounded-full text-indigo-300 border border-[#1e2a4a]">
                  {cat.totalItens ?? cat.total_itens ?? 0} produtos
                </span>
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(cat)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {cat.nome}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{cat.descricao || '—'}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-400">
            Nenhuma categoria encontrada.
          </div>
        )}
      </div>

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
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
              <Input
                label="Nome da Categoria *"
                placeholder="Ex: Sensores"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Descrição (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva brevemente os produtos desta categoria..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#10172a] border border-[#1e294b] text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : editingCategoria ? 'Salvar' : 'Criar Categoria'}
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
            <h3 className="text-lg font-bold text-white mb-2">Excluir Categoria</h3>
            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja excluir <span className="text-white font-semibold">{showDeleteConfirm.nome}</span>?
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

export default CategoriasPage;
