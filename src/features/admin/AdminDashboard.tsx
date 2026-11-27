import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { ArrowUpRight, CalendarDays, Flower2, Gift, LogOut, MapPin, Pencil, Users } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { createEvent, getAdminEvents, updateEvent } from '../event/event.api';
import type { EventRequest, EventResponse } from '../event/event.types';
import { EventForm } from '../event/EventForm';
import { InviteGroups } from '../invite-groups/InviteGroups';
import { Gifts } from '../gifts/Gifts';
import styles from './AdminDashboard.module.css';

interface AdminDashboardProps {
  login: string;
  signingOut: boolean;
  onLogout: () => void;
  onAccessDenied: (status: 401 | 403) => void;
}

type EventState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; event: EventResponse | null };

const eventDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
});
const deadlineFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });

export function AdminDashboard({ login, signingOut, onLogout, onAccessDenied }: AdminDashboardProps) {
  const [eventState, setEventState] = useState<EventState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingGift, setSavingGift] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const savePending = useRef(false);

  async function handleSave(request: EventRequest, receptionAtCeremonyLocation: boolean) {
    if (savePending.current || !formMode) return;
    const current = eventState.status === 'loaded' ? eventState.event : null;
    if (formMode === 'edit' && !current) return;
    savePending.current = true;
    setSaving(true);
    setNotification(null);
    try {
      const event = formMode === 'edit' && current
        ? await updateEvent(current.id, request, receptionAtCeremonyLocation)
        : await createEvent(request, receptionAtCeremonyLocation);
      setEventState({ status: 'loaded', event });
      setFormMode(null);
      setConfirmation(formMode === 'edit' ? 'Alterações salvas.' : 'Evento criado.');
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) onAccessDenied(401);
      else if (status === 403) setNotification('Não foi possível validar o salvamento. Recarregue a página e tente novamente.');
      else if (status === 400) setNotification('Confira os campos do evento e os dados da recepção.');
      else if (status === 404) setNotification('O evento não foi encontrado. Recarregue a página para conferir os dados atuais.');
      else if (status === 409) setNotification('Já existe um evento cadastrado. Recarregue a página para conferir.');
      else setNotification('Não foi possível confirmar o salvamento. Recarregue a página para verificar os dados antes de tentar novamente.');
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void getAdminEvents(controller.signal).then(
      (events) => {
        if (!controller.signal.aborted) setEventState({ status: 'loaded', event: events[0] ?? null });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          onAccessDenied(error.response.status);
          return;
        }
        setEventState({ status: 'error' });
        setNotification('Não foi possível carregar o evento. Tente novamente.');
      },
    );
    return () => controller.abort();
  }, [attempt, onAccessDenied]);

  function retry() {
    setNotification(null);
    setEventState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }

  const event = eventState.status === 'loaded' ? eventState.event : null;

  return (
    <div className={styles.dashboard}>
      <a className={styles.skipLink} href="#admin-main">Ir para o conteúdo</a>
      <aside className={styles.sidebar} aria-label="Painel administrativo">
        <div className={styles.brand}><Flower2 size={28} strokeWidth={1.25} aria-hidden="true" /><span>Wedding System</span></div>
        <nav className={styles.navigation} aria-label="Seções do painel">
          <a href="#evento"><CalendarDays size={18} aria-hidden="true" />Seu evento</a>
          {event && <a href="#locais"><MapPin size={18} aria-hidden="true" />Locais</a>}
          {event && !formMode && <a href="#convidados"><Users size={18} aria-hidden="true" />Convidados</a>}
          {event && !formMode && <a href="#presentes"><Gift size={18} aria-hidden="true" />Presentes</a>}
        </nav>
        <div className={styles.account}>
          <span className={styles.identity}>{login}</span>
          <button type="button" onClick={onLogout} disabled={signingOut || saving || savingGroup || savingGift} className={styles.logout}>
            <LogOut size={17} aria-hidden="true" />{signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </aside>

      <main id="admin-main" className={styles.main}>
        <header className={styles.heading}>
          <div><p>Painel administrativo</p><h1>{formMode === 'create' ? 'Criar evento' : formMode === 'edit' ? 'Editar evento' : 'Seu evento'}</h1></div>
          {event && !formMode && <button type="button" className={styles.edit} disabled={savingGroup || savingGift} onClick={() => { setConfirmation(null); setNotification(null); setFormMode('edit'); }}><Pencil size={16} aria-hidden="true" />Editar evento</button>}
        </header>
        {eventState.status === 'loading' && <p className={styles.state} role="status">Carregando seu evento…</p>}
        {eventState.status === 'error' && (
          <div className={styles.state}><p>Os dados do evento não estão disponíveis agora.</p><button className={styles.retry} onClick={retry} type="button">Tentar novamente</button></div>
        )}
        {confirmation && <p role="status">{confirmation}</p>}
        {formMode && <EventForm event={formMode === 'edit' ? event ?? undefined : undefined} pending={saving} onSubmit={handleSave} onCancel={() => { setFormMode(null); setNotification(null); }} onError={setNotification} />}
        {eventState.status === 'loaded' && !event && !formMode && (
          <section id="evento" className={styles.empty}>
            <CalendarDays size={32} strokeWidth={1.25} aria-hidden="true" />
            <h2>Nenhum evento cadastrado</h2>
            <p>Cadastre a data e os locais para começar a organizar seu evento.</p>
            <button type="button" className={styles.retry} onClick={() => { setNotification(null); setConfirmation(null); setFormMode('create'); }}>Criar evento</button>
          </section>
        )}
        {event && !formMode && (
          <>
            <section id="evento" className={styles.event} aria-labelledby="event-title">
              <p className={styles.caption}>O grande dia</p>
              <h2 id="event-title">{event.title}</h2>
              <dl className={styles.dates}>
                <div><dt>Data e horário</dt><dd><time dateTime={event.eventDate}>{eventDateFormatter.format(new Date(event.eventDate))}</time><small>Horário de Brasília</small></dd></div>
                <div><dt>Prazo para confirmar presença</dt><dd><time dateTime={event.rsvpDeadline}>{deadlineFormatter.format(new Date(`${event.rsvpDeadline}T00:00:00Z`))}</time></dd></div>
              </dl>
            </section>
            <section id="locais" className={styles.locations} aria-labelledby="locations-title">
              <h2 id="locations-title">Onde vamos celebrar</h2>
              <div className={styles.location}>
                <MapPin size={21} strokeWidth={1.5} aria-hidden="true" />
                <div><h3>Cerimônia</h3><p>{event.ceremonyLocation}</p></div>
                {event.ceremonyMapsUrl.startsWith('https://') && <a href={event.ceremonyMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver cerimônia no mapa (abre em nova aba)">Ver mapa<ArrowUpRight size={16} aria-hidden="true" /></a>}
              </div>
              <div className={styles.location}>
                <Flower2 size={21} strokeWidth={1.5} aria-hidden="true" />
                <div><h3>Recepção</h3><p>{event.receptionLocation ?? 'No mesmo local da cerimônia'}</p></div>
                {event.receptionMapsUrl?.startsWith('https://') && <a href={event.receptionMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver recepção no mapa (abre em nova aba)">Ver mapa<ArrowUpRight size={16} aria-hidden="true" /></a>}
              </div>
            </section>
            <InviteGroups key={event.id} eventId={event.id} onError={setNotification} onAccessDenied={onAccessDenied} onSavingChange={setSavingGroup} />
            <Gifts key={`gifts-${event.id}`} eventId={event.id} onError={setNotification} onAccessDenied={onAccessDenied} onSavingChange={setSavingGift} />
          </>
        )}
      </main>
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}
    </div>
  );
}
