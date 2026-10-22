import React from 'react';  
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Rotas de Controle
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestRoute from './components/routing/GuestRoute';
import AppLayout from './components/layout/AppLayout';

// Páginas de Autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordWizard from './pages/auth/ForgotPasswordWizard';

// Páginas Principais
import DashboardPage from './pages/dashboard/DashboardPage';
import ProdutosPage from './pages/produtos/ProdutosPage';
import MovimentacoesPage from './pages/movimentacoes/MovimentacoesPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import FornecedoresPage from './pages/fornecedores/FornecedoresPage';
import HistoricoPage from './pages/historico/HistoricoPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/esqueci-senha" element={<GuestRoute><ForgotPasswordWizard /></GuestRoute>} />
          <Route path="/recuperar-senha" element={<GuestRoute><ForgotPasswordWizard /></GuestRoute>} />
          <Route path="/resetar-senha" element={<GuestRoute><ForgotPasswordWizard /></GuestRoute>} />

          {/* ROTAS PROTEGIDAS (exigem JWT válido) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Acessível a ADMIN, GERENTE e OPERADOR */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/movimentacoes" element={<MovimentacoesPage />} />

            {/* Acessível a ADMIN e GERENTE */}
            <Route
              path="/categorias"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fornecedores"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <FornecedoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <HistoricoPage />
                </ProtectedRoute>
              }
            />

            {/* Acessível apenas a ADMIN */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;