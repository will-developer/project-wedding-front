import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  tone: 'error' | 'info';
  onDismiss: () => void;
}

export function Toast({ message, tone, onDismiss }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${tone === 'error' ? styles.error : ''}`}
      role={tone === 'error' ? 'alert' : 'status'}
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
