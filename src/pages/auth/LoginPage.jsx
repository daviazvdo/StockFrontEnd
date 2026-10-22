import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isValidEmail } from '../../utils/validators';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Informe o e-mail.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido.';
    }

    if (!senha) {
      newErrors.senha = 'Informe a senha.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);

    const result = await login(email, senha);

    setIsSubmitting(false);

    if (!result.success) {
      setApiError(result.error);
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: '0',
            }}
          >
            <span style={{ color: '#ffffff' }}>Keep</span>
            <span style={{ color: '#7c80f8' }}>Stock</span>
          </h1>


          <p
            style={{
              fontSize: '13px',
              color: '#cbd5e1',
              margin: '4px 0 0',
            }}
          >
            Acesse seu painel com as credenciais corporativas
          </p>
        </div>

        {/* Título */}
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 16px',
          }}
        >
          Bem-Vindo de volta
        </h2>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: '#14532d',
              color: '#bbf7d0',
              border: '1px solid #166534',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Erro da API */}
        {apiError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: '#450a0a',
              color: '#fecaca',
              border: '1px solid #991b1b',
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* E-mail */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
            >
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.email
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.email && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
            >
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.senha
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.senha && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.senha}
              </p>
            )}
          </div>


          <div
            style={{
              textAlign: 'right',
              marginBottom: '16px',
            }}
          >
            <Link
              to="/recuperar-senha"
              style={{
                color: '#a5b4fc',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: isSubmitting ? '#6366f1' : '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Rodapé */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#cbd5e1',
          }}
        >
          Ainda não possui uma conta?{' '}

          <Link
            to="/cadastro"
            style={{
              color: '#a5b4fc',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
