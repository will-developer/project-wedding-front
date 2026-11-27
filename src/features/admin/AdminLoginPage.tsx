import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './AdminLoginPage.module.css';

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className={styles.page} aria-labelledby="admin-login-title">
      <div className={styles.decoration} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.welcome}>Bem-vindo de volta.</p>
        <section className={styles.login}>
          <h1 className={styles.title} id="admin-login-title">Entrar</h1>
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.field}>
              <label className={styles.hidden} htmlFor="admin-username">Usuário</label>
              <input id="admin-username" name="username" autoComplete="username" placeholder="Usuário" required />
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
            <button className={styles.submit} type="submit" disabled>Acessar</button>
          </form>
        </section>
      </div>
    </main>
  );
}
