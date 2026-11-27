import { X } from 'lucide-react';
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
        <X aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
