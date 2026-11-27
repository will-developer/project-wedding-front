import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import styles from './InviteGroups.module.css';

interface InviteCodeProps {
  code: string;
  groupName: string;
  onError: (message: string) => void;
}

export function InviteCode({ code, groupName, onError }: InviteCodeProps) {
  const [copied, setCopied] = useState(false);
  const copying = useRef(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    if (copying.current) return;
    copying.current = true;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
      onError('Não foi possível copiar o código. Selecione o código do convite e copie manualmente.');
    } finally {
      copying.current = false;
    }
  }

  return (
    <div className={styles.code}>
      <span>Código do convite</span>
      <div className={styles.codeActions}>
        <code>{code}</code>
        <button type="button" className={styles.copy} aria-label={`Copiar código do grupo ${groupName}`} onClick={copy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <span className={styles.hidden} role="status">{copied ? `Código do grupo ${groupName} copiado.` : ''}</span>
    </div>
  );
}
