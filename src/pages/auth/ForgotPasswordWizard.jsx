import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../api/auth';
import { getErrorMessage } from '../../utils/errorParser';
import { isValidEmail } from '../../utils/validators';
import { Mail, Key, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Fluxo de recuperação de senha — 2 etapas:
 *   1) Informar e-mail → API gera/envia token (/api/v1/auth/esqueci-senha)
 *   2) Digitar o token recebido + nova senha (/api/v1/auth/resetar-senha)
 */
export function ForgotPasswordWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1);
  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState(
    tokenFromUrl ? 'Token de recuperação carregado da URL. Digite sua nova senha.' : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Etapa 1: envia o e-mail para a API
  async function handleRequestToken(e) {
    e.preventDefault();
    setApiError('');
    setInfoMessage('');
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Informe o e-mail cadastrado.' });
      return;
    }

    if (!isValidEmail(email)) {
      setErrors({ email: 'Informe um endereço de e-mail válido.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response?.devToken) {
        setToken(response.devToken);
        setInfoMessage('Token de recuperação gerado com sucesso e preenchido automaticamente (ambiente local/desenvolvimento). Cadastre sua nova senha abaixo.');
      } else {
        setInfoMessage(
          response?.message ||
            'Solicitação enviada! Se o e-mail estiver cadastrado no sistema, o token foi gerado. Insira o token abaixo para redefinir sua senha.'
        );
      }
      setStep(2);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Etapa 2: confirma a redefinição com token e nova senha
  async function handleResetPassword(e) {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const newErrors = {};
    if (!token.trim()) {
      newErrors.token = 'Informe o token de recuperação.';
    }
    if (!novaSenha) {
      newErrors.novaSenha = 'Informe a nova senha.';
    } else if (novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha precisa ter no mínimo 6 caracteres.';
    }
    if (novaSenha !== confirmarNovaSenha) {
      newErrors.confirmarNovaSenha = 'As senhas não coincidem.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, novaSenha);
      navigate('/login', {
        state: { message: 'Senha redefinida com sucesso! Faça login com suas novas credenciais.' },
      });
    } catch (error) {
      setApiError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  const cardStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const innerStyle = {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '32px',
    boxSizing: 'border-box',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '6px',
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '11px 14px',
    fontSize: '14px',
    border: hasError ? '1px solid #ef4444' : '1px solid #475569',
    borderRadius: '8px',
    color: '#ffffff',
    backgroundColor: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const errorTextStyle = {
    fontSize: '12px',
    color: '#fca5a5',
    marginTop: '5px',
    marginBottom: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={cardStyle}>
      <div style={innerStyle}>
        {/* Cabeçalho KeepStock */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#ffffff' }}>Keep</span>
            <span style={{ color: '#6366f1' }}>Stock</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>
            Recuperação de Acesso
          </p>
        </div>

        {/* Indicador visual de progresso */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '5px',
                borderRadius: '4px',
                backgroundColor: '#6366f1',
                transition: 'background-color 0.3s',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '5px',
                borderRadius: '4px',
                backgroundColor: step === 2 ? '#6366f1' : '#334155',
                transition: 'background-color 0.3s',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ color: step === 1 ? '#a5b4fc' : '#64748b', fontWeight: step === 1 ? '600' : '400' }}>
              1. Solicitar Token
            </span>
            <span style={{ color: step === 2 ? '#a5b4fc' : '#64748b', fontWeight: step === 2 ? '600' : '400' }}>
              2. Nova Senha
            </span>
          </div>
        </div>

        {/* Mensagem informativa / sucesso da etapa anterior */}
        {infoMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '18px',
              backgroundColor: '#064e3b',
              color: '#a7f3d0',
              border: '1px solid #059669',
              lineHeight: '1.4',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Erro retornado pela API */}
        {apiError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '18px',
              backgroundColor: '#450a0a',
              color: '#fecaca',
              border: '1px solid #dc2626',
              lineHeight: '1.4',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* ── ETAPA 1: Informar e-mail ── */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} noValidate>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', margin: '0 0 6px' }}>
                Esqueceu sua senha?
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0', lineHeight: '1.4' }}>
                Informe seu e-mail corporativo. Enviaremos as instruções e o token de segurança para você cadastrar uma nova senha.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={labelStyle}>
                E-mail cadastrado
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  style={inputStyle(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p style={errorTextStyle}>
                  <AlertCircle size={13} /> {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: isSubmitting ? '#4338ca' : '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Mail size={16} />
              {isSubmitting ? 'Enviando solicitação...' : 'Enviar Token de Recuperação'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setApiError('');
                  setErrors({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '4px',
                  textDecoration: 'underline',
                }}
              >
                Já possui um token de recuperação? Digite o token
              </button>
            </div>
          </form>
        )}

        {/* ── ETAPA 2: Token + Nova Senha ── */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} noValidate>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', margin: '0 0 6px' }}>
                Redefinir Senha
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0', lineHeight: '1.4' }}>
                Cole o token recebido e defina uma nova senha para acessar sua conta.
              </p>
            </div>

            {/* Token */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="token" style={labelStyle}>
                Token de Recuperação
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ex: a1b2c3d4e5f6..."
                style={{
                  ...inputStyle(!!errors.token),
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                }}
              />
              {errors.token ? (
                <p style={errorTextStyle}>
                  <AlertCircle size={13} /> {errors.token}
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', marginBottom: '0' }}>
                  Código/token alfanumérico gerado pelo sistema.
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="novaSenha" style={labelStyle}>
                Nova Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="novaSenha"
                  type={showNovaSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  style={{
                    ...inputStyle(!!errors.novaSenha),
                    paddingRight: '40px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  title={showNovaSenha ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.novaSenha && (
                <p style={errorTextStyle}>
                  <AlertCircle size={13} /> {errors.novaSenha}
                </p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div style={{ marginBottom: '22px' }}>
              <label htmlFor="confirmarNovaSenha" style={labelStyle}>
                Confirmar Nova Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmarNovaSenha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  style={{
                    ...inputStyle(!!errors.confirmarNovaSenha),
                    paddingRight: '40px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  title={showConfirmarSenha ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmarNovaSenha && (
                <p style={errorTextStyle}>
                  <AlertCircle size={13} /> {errors.confirmarNovaSenha}
                </p>
              )}
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setApiError('');
                  setErrors({});
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#94a3b8',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  padding: '11px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: isSubmitting ? '#4338ca' : '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s',
                }}
              >
                <Key size={16} />
                {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        )}

        {/* Rodapé: Voltar ao Login */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
          Lembrou a senha?{' '}
          <Link
            to="/login"
            style={{
              color: '#818cf8',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordWizard;
