import saveTheDate from '../../assets/guest-access/save-the-date.svg';
import weddingCrest from '../../assets/guest-access/wedding-crest.svg';
import styles from './GuestLoginPage.module.css';
import { GuestLoginForm } from './GuestLoginForm';
import { loginGuest } from './session.api';
import { getGuestLoginChallenge, getGuestLoginError, isGuestLoginRateLimited } from './guestLoginError';
import type { GuestLoginChallenge } from './guestLoginError';
import { TurnstileChallenge } from './TurnstileChallenge';
import { GuestAccessBackground } from './GuestAccessBackground';

interface Notification {
  id: number;
  message: string;
}

export function GuestLoginPage() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationId = useRef(0);
  const [status, setStatus] = useState<'idle' | 'pending' | 'authenticated'>('idle');
  const submitting = useRef(false);
  const [challenge, setChallenge] = useState<GuestLoginChallenge | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [challengeAttempt, setChallengeAttempt] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const notify = useCallback((message: string) => {
    setNotification({ id: ++notificationId.current, message });
  }, []);

  async function handleLogin(code: string) {
    if (submitting.current || status === 'authenticated') return;
    if (challenge && !turnstileToken) {
      notify('Conclua a verificação de segurança para continuar.');
      return;
    }
    submitting.current = true;
    setStatus('pending');

    try {
      await loginGuest(code, turnstileToken ?? undefined);
      setStatus('authenticated');
      setChallenge(null);
      setNotification(null);
    } catch (error: unknown) {
      setStatus('idle');
      const requestedChallenge = getGuestLoginChallenge(error);
      if (isGuestLoginRateLimited(error)) {
        setChallenge(null);
      } else if (requestedChallenge) {
        setChallenge(requestedChallenge);
      }
      notify(getGuestLoginError(error));
    } finally {
      setTurnstileToken(null);
      setChallengeAttempt((value) => value + 1);
      submitting.current = false;
    }
  }

  return (
    <main className={styles.page} aria-labelledby="guest-access-title">
      <GuestAccessBackground />

      <div className={styles.content}>
        <h1 ref={titleRef} className={styles.title} id="guest-access-title" tabIndex={-1}>
          <img src={saveTheDate} alt="Save the date" width="729" height="446" />
        </h1>

        <GuestLoginForm
          onSubmit={handleLogin}
          pending={status === 'pending'}
          authenticated={status === 'authenticated'}
          verificationRequired={challenge !== null && turnstileToken === null}
          onValidationError={(message) => {
            if (message) {
              notify(message);
            } else {
              setNotification(null);
            }
          }}
        >
          {challenge && status !== 'pending' && (
            <TurnstileChallenge
              key={challengeAttempt}
              siteKey={challenge.siteKey}
              action={challenge.action}
              onToken={setTurnstileToken}
              onError={notify}
            />
          )}
        </GuestLoginForm>

        <img
          className={styles.crest}
          src={weddingCrest}
          alt="Brasão de Anna e William"
          width="1739"
          height="2041"
        />
      </div>
      {notification && (
        <Toast
          key={notification.id}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}
    </main>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from '../../components/ui/Toast';
