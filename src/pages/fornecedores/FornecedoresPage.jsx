import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Truck, Plus, Search, Mail, Phone, MapPin, Pencil, Trash2, X } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

export function FornecedoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fornecedores, setFornecedores] = useState([
    { id: 1, nome: 'AutomaTech Componentes Ltda', cnpj: '12.345.678/0001-90', contato: 'Marcos Vinicius', email: 'vendas@automatech.com.br', telefone: '(11) 3456-7890', cidade: 'São Paulo/SP' },
    { id: 2, nome: 'Sensortec Sensores Industriais', cnpj: '98.765.432/0001-10', contato: 'Fernanda Rocha', email: 'comercial@sensortec.ind.br', telefone: '(19) 9876-5432', cidade: 'Campinas/SP' },
    { id: 3, nome: 'ConectaFio Cabos Especiais', cnpj: '45.123.789/0001-55', contato: 'Renato Alves', email: 'atendimento@conectafio.com', telefone: '(41) 3322-1100', cidade: 'Curitiba/PR' },
    { id: 4, nome: 'EletroPower Distribuidora S/A', cnpj: '33.888.999/0001-40', contato: 'Juliana Pires', email: 'juliana@eletropower.com.br', telefone: '(31) 2555-8800', cidade: 'Belo Horizonte/MG' },
  ]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ nome: '', cnpj: '', contato: '', endereco: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await inventoryService.getFornecedores();
      const arr = data?.data || data;
      if (arr && Array.isArray(arr) && arr.length > 0) setFornecedores(arr);
    }
    load();
  }, []);

  function openCreate() {
    setEditingFornecedor(null);
    setFormData({ nome: '', cnpj: '', contato: '', endereco: '' });
    setFormError('');
    setShowModal(true);
  }

  function openEdit(f) {
    setEditingFornecedor(f);
    setFormData({
      nome: f.nome || f.razaoSocial || '',
      cnpj: f.cnpj || '',
      contato: f.contato || '',
      endereco: f.endereco || f.cidade || '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.nome.trim()) return setFormError('Razão Social é obrigatória.');
    if (!formData.cnpj.trim()) return setFormError('CNPJ é obrigatório.');

    const payload = {
      nome: formData.nome.trim(),
      cnpj: formData.cnpj.trim(),
      ...(formData.contato && { contato: formData.contato.trim() }),
      ...(formData.endereco && { endereco: formData.endereco.trim() }),
    };

    setIsSubmitting(true);
    try {
      if (editingFornecedor) {
        const res = await inventoryService.updateFornecedor(editingFornecedor.id, payload);
        const updated = res?.fornecedor || { ...editingFornecedor, ...payload };
        setFornecedores((prev) => prev.map((f) => (f.id === editingFornecedor.id ? updated : f)));
      } else {
        const res = await inventoryService.createFornecedor(payload);
        const created = res?.fornecedor || { id: Date.now(), ...payload };
        setFornecedores((prev) => [...prev, created]);
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
      await inventoryService.deleteFornecedor(id);
      setFornecedores((prev) => prev.filter((f) => f.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const filtered = fornecedores.filter((f) => {
    const nome = f.nome || f.razaoSocial || '';
    return (
      nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cnpj || '').includes(searchTerm) ||
      (f.contato || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Fornecedores Cadastrados</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Parceiros comerciais e canais de suprimento de estoque.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          Novo Fornecedor
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por Razão Social, CNPJ ou Contato..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">{f.nome || f.razaoSocial}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">CNPJ: {f.cnpj}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Truck className="w-4 h-4" />
                </span>
                <button
                  onClick={() => openEdit(f)}
                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(f)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#17223e] space-y-2 text-xs text-slate-300">
              {(f.email || f.contato) && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{f.email || f.contato}</span>
                </div>
              )}
              {f.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{f.telefone}{f.contato ? ` • Contato: ${f.contato}` : ''}</span>
                </div>
              )}
              {(f.endereco || f.cidade) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{f.endereco || f.cidade}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400">
            Nenhum fornecedor encontrado.
          </div>
        )}
      </div>

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                label="Razão Social *"
                placeholder="Ex: AutomaTech Componentes Ltda"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
              <Input
                label="CNPJ *"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
              />
              <Input
                label="Nome do Contato"
                placeholder="Ex: Marcos Vinicius"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
              />
              <Input
                label="Endereço / Cidade"
                placeholder="Ex: São Paulo/SP"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : editingFornecedor ? 'Salvar' : 'Cadastrar'}
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
            <h3 className="text-lg font-bold text-white mb-2">Excluir Fornecedor</h3>
            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja excluir{' '}
              <span className="text-white font-semibold">{showDeleteConfirm.nome || showDeleteConfirm.razaoSocial}</span>?
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

export default FornecedoresPage;
