import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Toast } from '../../components/ui/Toast';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';
import { getAdminSession, logoutAdmin } from './adminSession.api';
import type { AdminSessionResponse } from './adminSession.api';
import styles from './AdminAccessExperience.module.css';

type AccessState =
  | { status: 'checking' }
  | { status: 'anonymous' }
  | { status: 'forbidden' }
  | { status: 'error' }
  | { status: 'authenticated'; session: AdminSessionResponse };

export function AdminAccessExperience() {
  const [access, setAccess] = useState<AccessState>({ status: 'checking' });
  const [attempt, setAttempt] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const logoutPending = useRef(false);
  const handleAccessDenied = useCallback((status: 401 | 403) => {
    setNotification(null);
    setAccess({ status: status === 401 ? 'anonymous' : 'forbidden' });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void getAdminSession(controller.signal).then(
      (session) => {
        if (!controller.signal.aborted) setAccess({ status: 'authenticated', session });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        if (isAxiosError(error) && error.response?.status === 401) {
          setAccess({ status: 'anonymous' });
        } else if (isAxiosError(error) && error.response?.status === 403) {
          setAccess({ status: 'forbidden' });
        } else {
          setAccess({ status: 'error' });
          setNotification('Não foi possível verificar sua sessão. Tente novamente.');
        }
      },
    );

    return () => controller.abort();
  }, [attempt]);

  function refreshSession() {
    setNotification(null);
    setAccess({ status: 'checking' });
    setAttempt((value) => value + 1);
  }

  async function handleLogout() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setSigningOut(true);
    setNotification(null);
    try {
      await logoutAdmin();
      setAccess({ status: 'anonymous' });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setAccess({ status: 'anonymous' });
      } else {
        setNotification('Não foi possível sair. Tente novamente.');
      }
    } finally {
      logoutPending.current = false;
      setSigningOut(false);
    }
  }

  if (access.status === 'anonymous') {
    return <AdminLoginPage onAuthenticated={refreshSession} />;
  }

  if (access.status === 'authenticated') {
    return (
      <>
        <AdminDashboard login={access.session.login} signingOut={signingOut} onLogout={handleLogout} onAccessDenied={handleAccessDenied} />
        {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}
      </>
    );
  }

  return (
    <main className={styles.page} aria-labelledby="admin-panel-title">
      <div className={styles.panel}>
        <h1 id="admin-panel-title" className={styles.title}>Painel admin</h1>
        {access.status === 'checking' && <p role="status">Verificando seu acesso…</p>}
        {access.status === 'error' && (
          <button type="button" className={styles.action} onClick={refreshSession}>Tentar novamente</button>
        )}
        {access.status === 'forbidden' && (
          <>
            <p>Este painel exige uma conta administradora.</p>
            <button type="button" className={styles.action} onClick={() => setAccess({ status: 'anonymous' })}>
              Entrar com outra conta
            </button>
          </>
        )}
      </div>
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}
    </main>
  );
}
