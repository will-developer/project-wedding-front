import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateInviteGroupRequest } from './inviteGroups.types';
import styles from './InviteGroups.module.css';

interface InviteGroupFormProps {
  pending: boolean;
  onSubmit: (request: CreateInviteGroupRequest) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export function InviteGroupForm({ pending, onSubmit, onCancel, onError }: InviteGroupFormProps) {
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState('');
  const [guests, setGuests] = useState(() => [{ id: crypto.randomUUID(), name: '', isChild: false }]);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    for (const input of event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="text"]')) {
      if (!input.value.trim() || input.value.length > 160) {
        input.focus();
        onError(!input.value.trim() ? `Preencha o campo “${input.labels?.[0]?.textContent}”.` : 'Os nomes devem ter até 160 caracteres.');
        return;
      }
    }
    onSubmit({ groupName: groupName.trim(), notes: notes.trim() || null, guests: guests.map(({ name, isChild }) => ({ name: name.trim(), isChild })) });
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
      <h3 ref={heading} tabIndex={-1}>Novo grupo</h3>
      <fieldset disabled={pending} className={styles.fields}>
        <legend className={styles.hidden}>Dados do grupo</legend>
        <label className={styles.field} htmlFor="group-name"><span>Nome do grupo</span><input id="group-name" type="text" value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={160} required placeholder="Ex.: Família Oliveira" /></label>
        <label className={styles.field} htmlFor="group-notes"><span>Observações <small>(opcional)</small></span><textarea id="group-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></label>
        <p className={styles.hint}>Inclua todas as pessoas que receberão o mesmo código de convite.</p>
        {guests.map((guest, index) => (
          <fieldset className={styles.guestFields} key={guest.id}>
            <legend>Pessoa {index + 1}</legend>
            <label className={styles.field} htmlFor={`guest-${guest.id}`}><span>Nome da pessoa {index + 1}</span><input id={`guest-${guest.id}`} type="text" value={guest.name} maxLength={160} required onChange={(event) => setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, name: event.target.value } : item))} /></label>
            <div className={styles.guestActions}>
              <label className={styles.checkbox}><input type="checkbox" checked={guest.isChild} onChange={(event) => setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, isChild: event.target.checked } : item))} />É criança</label>
              {guests.length > 1 && <button className={styles.textButton} type="button" aria-label={`Remover pessoa ${index + 1}`} onClick={() => setGuests((current) => current.filter((item) => item.id !== guest.id))}><Trash2 size={16} aria-hidden="true" />Remover</button>}
            </div>
          </fieldset>
        ))}
        <button type="button" className={styles.secondary} onClick={() => setGuests((current) => [...current, { id: crypto.randomUUID(), name: '', isChild: false }])}><Plus size={16} aria-hidden="true" />Adicionar pessoa</button>
      </fieldset>
      <div className={styles.actions}>
        <button className={styles.secondary} type="button" disabled={pending} onClick={onCancel}>Cancelar</button>
        <button className={styles.primary} type="submit" disabled={pending}>{pending ? 'Criando…' : 'Criar grupo'}</button>
      </div>
    </form>
  );
}
