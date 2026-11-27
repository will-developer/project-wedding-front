import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles.error}`}
      role="alert"
      aria-atomic="true"
    >
      <p>{message}</p>
      <button type="button" onClick={onDismiss} aria-label="Fechar notificação">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
