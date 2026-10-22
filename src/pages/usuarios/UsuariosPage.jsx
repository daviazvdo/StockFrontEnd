import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Search, UserPlus, Pencil, Trash2, X, ShieldCheck } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

const PERFIS = ['ADMIN', 'GERENTE', 'OPERADOR'];

export function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Arthur Faleiros', email: 'arthur@keepstock.io', perfil: 'ADMIN', status: 'success', dataCriacao: '01/08/2026' },
    { id: 2, nome: 'Mariana Costa', email: 'mariana.costa@empresa.com', perfil: 'GERENTE', status: 'success', dataCriacao: '10/08/2026' },
    { id: 3, nome: 'Carlos Lima', email: 'carlos.lima@empresa.com', perfil: 'OPERADOR', status: 'success', dataCriacao: '15/08/2026' },
    { id: 4, nome: 'Roberta Dias', email: 'roberta.dias@empresa.com', perfil: 'OPERADOR', status: 'success', dataCriacao: '20/08/2026' },
  ]);

  // Modal criar
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ nome: '', email: '', senha: '', perfil: 'OPERADOR' });
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Modal alterar perfil
  const [showRoleModal, setShowRoleModal] = useState(null); // usuario
  const [novoPerfil, setNovoPerfil] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Confirmar exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await inventoryService.getUsuarios();
      const arr = data?.data || data;
      if (arr && Array.isArray(arr) && arr.length > 0) setUsuarios(arr);
    }
    load();
  }, []);

  function openCreate() {
    setCreateForm({ nome: '', email: '', senha: '', perfil: 'OPERADOR' });
    setCreateError('');
    setShowCreateModal(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    if (!createForm.nome.trim()) return setCreateError('Nome é obrigatório.');
    if (!createForm.email.trim()) return setCreateError('E-mail é obrigatório.');
    if (!createForm.senha || createForm.senha.length < 6) return setCreateError('Senha deve ter no mínimo 6 caracteres.');
    if (!createForm.perfil) return setCreateError('Selecione um perfil.');

    setIsCreating(true);
    try {
      const res = await inventoryService.createUsuario({
        nome: createForm.nome.trim(),
        email: createForm.email.trim(),
        senha: createForm.senha,
        perfil: createForm.perfil,
      });
      const created = res?.user || { id: Date.now(), ...createForm, status: 'success', dataCriacao: new Date().toLocaleDateString('pt-BR') };
      setUsuarios((prev) => [...prev, created]);
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }

  function openRoleModal(user) {
    setShowRoleModal(user);
    setNovoPerfil(user.perfil);
  }

  async function handleUpdateRole() {
    if (!novoPerfil || novoPerfil === showRoleModal.perfil) { setShowRoleModal(null); return; }
    setIsUpdatingRole(true);
    try {
      const res = await inventoryService.updateUsuarioPerfil(showRoleModal.id, novoPerfil);
      const updated = res?.user || { ...showRoleModal, perfil: novoPerfil };
      setUsuarios((prev) => prev.map((u) => (u.id === showRoleModal.id ? updated : u)));
      setShowRoleModal(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsUpdatingRole(false);
    }
  }

  async function handleDelete(id) {
    try {
      await inventoryService.deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const filtered = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.perfil.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">Administração de Usuários</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Restrito: ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerenciamento de contas e níveis hierárquicos de acesso à plataforma.
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={openCreate}>
          Criar Usuário
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por nome, e-mail ou perfil..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">Usuário</th>
                <th className="py-3 px-6 font-semibold">E-mail</th>
                <th className="py-3 px-6 font-semibold">Perfil de Acesso</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Cadastrado em</th>
                <th className="py-3 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#121c38]/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {user.nome.charAt(0)}
                      </div>
                      <span>{user.nome}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300 font-mono">{user.email}</td>
                  <td className="py-4 px-6">
                    <RoleBadge role={user.perfil} size="sm" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={user.status || 'success'} label="Ativo" />
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-400 font-mono">
                    {user.dataCriacao || user.created_at || '—'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-colors"
                        title="Alterar Perfil"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Criar Novo Usuário</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome Completo *"
                placeholder="Ex: João da Silva"
                value={createForm.nome}
                onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                required
              />
              <Input
                label="E-mail *"
                type="email"
                placeholder="usuario@empresa.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
              <Input
                label="Senha *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={createForm.senha}
                onChange={(e) => setCreateForm({ ...createForm, senha: e.target.value })}
                required
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Perfil de Acesso *
                </label>
                <select
                  value={createForm.perfil}
                  onChange={(e) => setCreateForm({ ...createForm, perfil: e.target.value })}
                  className="w-full bg-[#10172a] border border-[#1e294b] text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PERFIS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Perfil */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Alterar Perfil</h3>
              <button onClick={() => setShowRoleModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Usuário: <span className="text-white font-semibold">{showRoleModal.nome}</span>
            </p>
            <div className="space-y-2 mb-5">
              {PERFIS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNovoPerfil(p)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-colors text-left px-4 ${
                    novoPerfil === p
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-[#10172a] border-[#1e294b] text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowRoleModal(null)}>
                Cancelar
              </Button>
              <Button variant="primary" fullWidth disabled={isUpdatingRole} onClick={handleUpdateRole}>
                {isUpdatingRole ? 'Salvando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Excluir Usuário</h3>
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

export default UsuariosPage;
