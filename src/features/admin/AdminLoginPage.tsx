import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { loginAdmin } from './adminSession.api';
import { getAdminLoginError } from './adminLoginError';
import styles from './AdminLoginPage.module.css';

export function AdminLoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'authenticated'>('idle');
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);
  const notificationId = useRef(0);
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || status === 'authenticated') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const username = String(data.get('username') ?? '').trim();
    const password = String(data.get('password') ?? '');
    if (!username || !password) {
      setNotification({ id: ++notificationId.current, message: 'Preencha o usuário e a senha para acessar.' });
      return;
    }

    submitting.current = true;
    setStatus('pending');
    setNotification(null);
    try {
      await loginAdmin(username, password);
      form.reset();
      setShowPassword(false);
      setStatus('authenticated');
      onAuthenticated();
    } catch (error: unknown) {
      setStatus('idle');
      setNotification({ id: ++notificationId.current, message: getAdminLoginError(error) });
    } finally {
      submitting.current = false;
    }
  }

  return (
    <main className={styles.page} aria-labelledby="admin-login-title">
      <div className={styles.decoration} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.welcome}>Bem-vindo de volta.</p>
        <section className={styles.login}>
          <h1 className={styles.title} id="admin-login-title">Entrar</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={status === 'pending'}>
            <div className={styles.field}>
              <label className={styles.hidden} htmlFor="admin-username">Usuário</label>
              <input id="admin-username" name="username" autoComplete="username" placeholder="Usuário" required disabled={status !== 'idle'} autoCapitalize="none" spellCheck={false} />
            </div>
            <div className={styles.field}>
              <label className={styles.hidden} htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Senha"
                required
                disabled={status !== 'idle'}
              />
              <button
                className={styles.visibility}
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.5} aria-hidden="true" />}
              </button>
            </div>
            <button className={styles.submit} type="submit" disabled={status !== 'idle'}>
              {status === 'pending' ? 'Acessando…' : status === 'authenticated' ? 'Acesso liberado' : 'Acessar'}
            </button>
            <span className={styles.hidden} role="status">
              {status === 'authenticated' ? 'Seu acesso ao painel foi validado.' : ''}
            </span>
          </form>
        </section>
      </div>
      {notification && (
        <Toast key={notification.id} message={notification.message} onDismiss={() => setNotification(null)} />
      )}
    </main>
  );
}
