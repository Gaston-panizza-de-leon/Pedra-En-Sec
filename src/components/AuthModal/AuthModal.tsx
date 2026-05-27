import { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuthStore } from '../../store/useAuthStore';
import { FaXmark } from 'react-icons/fa6';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';
type Errors = Partial<Record<'identifier' | 'username' | 'email' | 'password' | 'confirm' | 'form', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const register = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<Mode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useFocusTrap(isOpen, modalRef);

  // Reinicia el formulario cada vez que se abre o se cambia de modo.
  function reset() {
    setIdentifier('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setErrors({});
    setSubmitting(false);
  }

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      reset();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  function validate(): Errors {
    const e: Errors = {};
    if (mode === 'register') {
      if (username.trim().length < 3) e.username = 'El usuario debe tener al menos 3 caracteres.';
      if (!EMAIL_RE.test(email.trim())) e.email = 'Introduce un correo electrónico válido.';
      if (password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.';
      if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.';
    } else {
      if (identifier.trim() === '') e.identifier = 'Introduce tu usuario o correo.';
      if (password === '') e.password = 'Introduce tu contraseña.';
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const error =
      mode === 'register'
        ? await register(username, email, password)
        : await login(identifier, password);
    setSubmitting(false);

    if (error) {
      setErrors({ form: error });
    } else {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-modal__close" onClick={onClose} aria-label="Cerrar">
          <FaXmark />
        </button>

        <div className="auth-modal__body">
          <h2 id="auth-modal-title" className="auth-modal__title">
            {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h2>
          <p className="auth-modal__subtitle">
            Tu cuenta de senderista guarda tus rutas favoritas en este dispositivo.
          </p>

          {/* Conmutador de modo */}
          <div className="auth-modal__tabs" role="tablist" aria-label="Modo de acceso">
            <button
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-modal__tab ${mode === 'login' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Entrar
            </button>
            <button
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-modal__tab ${mode === 'register' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Registrarse
            </button>
          </div>

          <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="auth-modal__field">
                <label htmlFor="auth-username">Nombre de usuario</label>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'err-username' : undefined}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <span id="err-username" className="auth-modal__error" role="alert">
                    {errors.username}
                  </span>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-modal__field">
                <label htmlFor="auth-identifier">Usuario o correo</label>
                <input
                  id="auth-identifier"
                  type="text"
                  value={identifier}
                  autoComplete="username"
                  aria-invalid={!!errors.identifier}
                  aria-describedby={errors.identifier ? 'err-identifier' : undefined}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                {errors.identifier && (
                  <span id="err-identifier" className="auth-modal__error" role="alert">
                    {errors.identifier}
                  </span>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div className="auth-modal__field">
                <label htmlFor="auth-email">Correo electrónico</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'err-email' : undefined}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <span id="err-email" className="auth-modal__error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>
            )}

            <div className="auth-modal__field">
              <label htmlFor="auth-password">Contraseña</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'err-password' : undefined}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span id="err-password" className="auth-modal__error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {mode === 'register' && (
              <div className="auth-modal__field">
                <label htmlFor="auth-confirm">Repite la contraseña</label>
                <input
                  id="auth-confirm"
                  type="password"
                  value={confirm}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirm}
                  aria-describedby={errors.confirm ? 'err-confirm' : undefined}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {errors.confirm && (
                  <span id="err-confirm" className="auth-modal__error" role="alert">
                    {errors.confirm}
                  </span>
                )}
              </div>
            )}

            {errors.form && (
              <p className="auth-modal__form-error" role="alert">
                {errors.form}
              </p>
            )}

            <button type="submit" className="auth-modal__submit" disabled={submitting}>
              {submitting
                ? 'Procesando…'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-modal__switch">
            {mode === 'login' ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              className="auth-modal__switch-btn"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}