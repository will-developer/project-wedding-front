import beachPoster from '../../assets/guest-access/beach-poster.jpg';
import saveTheDate from '../../assets/guest-access/save-the-date.svg';
import weddingCrest from '../../assets/guest-access/wedding-crest.svg';
import styles from './GuestLoginPage.module.css';
import { GuestLoginForm } from './GuestLoginForm';
import { loginGuest } from './session.api';
import { getGuestLoginError } from './guestLoginError';

interface Notification {
  id: number;
  message: string;
}

export function GuestLoginPage() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationId = useRef(0);
  const [status, setStatus] = useState<'idle' | 'pending' | 'authenticated'>('idle');
  const submitting = useRef(false);

  function notify(message: string) {
    setNotification({ id: ++notificationId.current, message });
  }

  async function handleLogin(code: string) {
    if (submitting.current || status === 'authenticated') return;
    submitting.current = true;
    setStatus('pending');

    try {
      await loginGuest(code);
      setStatus('authenticated');
      setNotification(null);
    } catch (error: unknown) {
      setStatus('idle');
      notify(getGuestLoginError(error));
    } finally {
      submitting.current = false;
    }
  }

  return (
    <main className={styles.page} aria-labelledby="guest-access-title">
      <img className={styles.backdrop} src={beachPoster} alt="" fetchPriority="high" />

      <div className={styles.content}>
        <h1 className={styles.title} id="guest-access-title">
          <img src={saveTheDate} alt="Save the date" width="729" height="446" />
        </h1>

        <GuestLoginForm
          onSubmit={handleLogin}
          pending={status === 'pending'}
          authenticated={status === 'authenticated'}
          onValidationError={(message) => {
            if (message) {
              notify(message);
            } else {
              setNotification(null);
            }
          }}
        />

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
import { useRef, useState } from 'react';
import { Toast } from '../../components/ui/Toast';
