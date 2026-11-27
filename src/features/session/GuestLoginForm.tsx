import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import styles from './GuestLoginForm.module.css';
import { getInvitationCodeFromHash, normalizeInvitationCode } from './invitationCode';

interface GuestLoginFormProps {
  onSubmit: (code: string) => void;
  onValidationError: (message: string | null) => void;
  pending: boolean;
  authenticated: boolean;
  verificationRequired?: boolean;
  children?: ReactNode;
}

export function GuestLoginForm({ onSubmit, onValidationError, pending, authenticated, verificationRequired = false, children }: GuestLoginFormProps) {
  const [code, setCode] = useState(() => getInvitationCodeFromHash(window.location.hash));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const previousVerificationRequired = useRef(verificationRequired);
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.slice(1));
    if (!params.has('code')) return;
    params.delete('code');
    url.hash = params.toString();
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    if (verificationRequired) {
      verificationRef.current?.focus({ preventScroll: true });
    } else if (previousVerificationRequired.current && !pending) {
      inputRef.current?.focus({ preventScroll: true });
    }
    previousVerificationRequired.current = verificationRequired;
  }, [verificationRequired, pending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || authenticated || verificationRequired) return;
    const normalizedCode = normalizeInvitationCode(code);

    if (normalizedCode === null) {
      const message = 'Código inválido. Verifique as 6 letras ou números no seu convite físico.';
      setError(message);
      onValidationError(message);
      inputRef.current?.focus();
      return;
    }

    setCode(normalizedCode);
    setError(null);
    onValidationError(null);
    onSubmit(normalizedCode);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={pending} noValidate>
      <div hidden={verificationRequired}>
        <label className={styles.hiddenLabel} htmlFor={inputId}>
          Código do convite
        </label>
        <input
          ref={inputRef}
          className={styles.codeInput}
          id={inputId}
          name="code"
          type="text"
          value={code}
          readOnly={pending || authenticated}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
            onValidationError(null);
          }}
          placeholder="Seu código"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          required
        />
        <p className={styles.hint} id={hintId}>
          As 6 letras ou números que estão no seu convite.
        </p>
        {error && (
          <p className={styles.hiddenLabel} id={errorId}>
            {error}
          </p>
        )}
        <button className={styles.continueButton} type="submit" disabled={pending || authenticated || verificationRequired}>
          {pending ? 'Acessando convite…' : authenticated ? 'Acesso liberado' : 'Confirmar presença'}
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </button>
      </div>
      <div
        ref={verificationRef}
        className={styles.verification}
        hidden={!verificationRequired}
        tabIndex={-1}
        aria-label="Conclua a verificação de segurança"
      >
        {children}
      </div>
    </form>
  );
}
