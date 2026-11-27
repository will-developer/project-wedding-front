import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import styles from './GuestLoginForm.module.css';

interface GuestLoginFormProps {
  onSubmit: (code: string) => void;
  onValidationError: (message: string | null) => void;
}

export function GuestLoginForm({ onSubmit, onValidationError }: GuestLoginFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCode = code.trim();

    if (!/^[a-z0-9]{6}$/i.test(trimmedCode)) {
      const message = 'Código inválido. Verifique as 6 letras ou números no seu convite físico.';
      setError(message);
      onValidationError(message);
      inputRef.current?.focus();
      return;
    }

    const normalizedCode = trimmedCode.toUpperCase();
    setCode(normalizedCode);
    setError(null);
    onValidationError(null);
    onSubmit(normalizedCode);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
      <button className={styles.continueButton} type="submit">
        Confirmar presença
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 12h14m-5-5 5 5-5 5" />
        </svg>
      </button>
    </form>
  );
}
