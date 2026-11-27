import beachPoster from '../../assets/guest-access/beach-poster.jpg';
import saveTheDate from '../../assets/guest-access/save-the-date.svg';
import weddingCrest from '../../assets/guest-access/wedding-crest.svg';
import styles from './GuestLoginPage.module.css';
import { GuestLoginForm } from './GuestLoginForm';

interface Notification {
  id: number;
  message: string;
  tone: 'error' | 'info';
}

export function GuestLoginPage() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationId = useRef(0);

  function notify(message: string, tone: Notification['tone']) {
    setNotification({ id: ++notificationId.current, message, tone });
  }

  return (
    <main className={styles.page} aria-labelledby="guest-access-title">
      <img className={styles.backdrop} src={beachPoster} alt="" fetchPriority="high" />

      <div className={styles.content}>
        <h1 className={styles.title} id="guest-access-title">
          <img src={saveTheDate} alt="Save the date" width="729" height="446" />
        </h1>

        <GuestLoginForm
          onSubmit={() => notify('O acesso ao convite estará disponível em breve.', 'info')}
          onValidationError={(message) => {
            if (message) {
              notify(message, 'error');
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
          tone={notification.tone}
          onDismiss={() => setNotification(null)}
        />
      )}
    </main>
  );
}
import { useRef, useState } from 'react';
import { Toast } from '../../components/ui/Toast';
