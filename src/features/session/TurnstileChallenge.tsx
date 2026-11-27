import { useEffect, useRef, useState } from 'react';
import { loadTurnstile } from './turnstile';
import styles from './TurnstileChallenge.module.css';

interface TurnstileChallengeProps {
  siteKey: string;
  action: string;
  onToken: (token: string | null) => void;
  onError: (message: string) => void;
}

export function TurnstileChallenge({ siteKey, action, onToken, onError }: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    let removeWidget: (() => void) | undefined;

    function fail() {
      if (!active) return;
      onToken(null);
      onError('Não foi possível concluir a verificação de segurança. Tente verificar novamente.');
    }

    function expire() {
      if (!active) return;
      onToken(null);
      onError('A verificação de segurança expirou. Faça a verificação novamente.');
    }

    loadTurnstile().then((api) => {
      if (!active) return;
      const id = api.render(container, {
        sitekey: siteKey,
        action,
        theme: 'light',
        size: 'normal',
        language: 'pt-br',
        'response-field': false,
        callback: (token) => {
          if (active) onToken(token);
        },
        'expired-callback': expire,
        'timeout-callback': expire,
        'error-callback': fail,
      });
      if (id === undefined) {
        fail();
        return;
      }
      removeWidget = () => api.remove(id);
    }).catch(fail);

    return () => {
      active = false;
      removeWidget?.();
    };
  }, [siteKey, action, attempt, onToken, onError]);

  return (
    <section className={styles.challenge} aria-label="Verificação de segurança">
      <p>Conclua a verificação de segurança para continuar.</p>
      <div ref={containerRef} className={styles.widget} />
      <button
        type="button"
        className={styles.retry}
        onClick={() => {
          onToken(null);
          setAttempt((value) => value + 1);
        }}
      >
        Verificar novamente
      </button>
    </section>
  );
}
