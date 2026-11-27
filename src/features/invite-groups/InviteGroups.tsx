import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Plus, Users } from 'lucide-react';
import { InviteGroupForm } from './InviteGroupForm';
import { createInviteGroup, getInviteGroups } from './inviteGroups.api';
import type { CreateInviteGroupRequest, InviteGroupResponse } from './inviteGroups.types';
import styles from './InviteGroups.module.css';

interface InviteGroupsProps {
  eventId: string;
  onError: (message: string) => void;
  onAccessDenied: (status: 401 | 403) => void;
  onSavingChange: (pending: boolean) => void;
}

type GroupsState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; groups: InviteGroupResponse[] };
const statusLabels: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', declined: 'Recusada', expired: 'Prazo encerrado' };

export function InviteGroups({ eventId, onError, onAccessDenied, onSavingChange }: InviteGroupsProps) {
  const [state, setState] = useState<GroupsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    void getInviteGroups(eventId, controller.signal).then((groups) => {
      if (!controller.signal.aborted) setState({ status: 'loaded', groups });
    }, (error: unknown) => {
      if (controller.signal.aborted) return;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) { onAccessDenied(status); return; }
      setState({ status: 'error' });
      onError('Não foi possível carregar os grupos de convidados. Tente novamente.');
    });
    return () => controller.abort();
  }, [eventId, attempt, onError, onAccessDenied]);

  async function save(request: CreateInviteGroupRequest) {
    if (pending.current || state.status !== 'loaded') return;
    pending.current = true;
    setSaving(true);
    onSavingChange(true);
    onError('');
    try {
      const group = await createInviteGroup(eventId, request);
      setState((current) => current.status === 'loaded' ? { status: 'loaded', groups: [...current.groups, group].sort((a, b) => a.groupName.localeCompare(b.groupName, 'pt-BR')) } : current);
      setCreating(false);
      setCreated(true);
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) onAccessDenied(401);
      else if (status === 400) onError('Confira o nome do grupo e os nomes das pessoas. Cada nome deve ter até 160 caracteres.');
      else if (status === 403) onError('Não foi possível validar o cadastro. Recarregue a página e tente novamente.');
      else if (status === 404) onError('O evento não foi encontrado. Recarregue a página para conferir.');
      else onError('Não foi possível confirmar o cadastro do grupo. Recarregue a página e confira a lista antes de tentar novamente.');
    } finally {
      pending.current = false;
      setSaving(false);
      onSavingChange(false);
    }
  }

  return (
    <section id="convidados" className={styles.section} aria-labelledby="groups-heading">
      <header className={styles.heading}>
        <div><h2 id="groups-heading">Grupos de convidados</h2><p>Cada grupo compartilha um código de acesso ao convite.</p></div>
        {state.status === 'loaded' && !creating && <button type="button" className={styles.primary} onClick={() => { onError(''); setCreated(false); setCreating(true); }}><Plus size={16} aria-hidden="true" />Criar grupo</button>}
      </header>
      {created && <p role="status">Grupo criado. O código está disponível abaixo.</p>}
      {state.status === 'loading' && <p role="status">Carregando convidados…</p>}
      {state.status === 'error' && <div><p>Os grupos não estão disponíveis agora.</p><button type="button" className={styles.secondary} onClick={() => { onError(''); setState({ status: 'loading' }); setAttempt((value) => value + 1); }}>Tentar novamente</button></div>}
      {creating && <InviteGroupForm pending={saving} onSubmit={save} onError={onError} onCancel={() => { setCreating(false); onError(''); }} />}
      {state.status === 'loaded' && !state.groups.length && !creating && <div className={styles.empty}><Users size={28} strokeWidth={1.25} aria-hidden="true" /><h3>Sua lista começa aqui</h3><p>Crie um grupo para uma família, um casal ou uma pessoa.</p></div>}
      {state.status === 'loaded' && state.groups.length > 0 && <ul className={styles.list}>{state.groups.map((group) => <li className={styles.group} key={group.id}>
        <div className={styles.groupHeading}><h3>{group.groupName}</h3><div className={styles.code}><span>Código do convite</span><code>{group.inviteCode}</code></div></div>
        {group.notes && <p className={styles.notes}>{group.notes}</p>}
        <ul className={styles.people}>{group.guests.map((guest) => <li key={guest.id}><span>{guest.name}{guest.isChild && <small> · Criança</small>}</span><span className={styles.status}>{statusLabels[guest.rsvpStatus] ?? 'Não informado'}</span></li>)}</ul>
      </li>)}</ul>}
    </section>
  );
}
