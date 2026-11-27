import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { ArrowUpRight, CalendarDays, Flower2, LogOut, MapPin } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { getAdminEvents } from '../event/event.api';
import type { EventResponse } from '../event/event.types';
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
        </nav>
        <div className={styles.account}>
          <span className={styles.identity}>{login}</span>
          <button type="button" onClick={onLogout} disabled={signingOut} className={styles.logout}>
            <LogOut size={17} aria-hidden="true" />{signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </aside>

      <main id="admin-main" className={styles.main}>
        <header className={styles.heading}>
          <p>Painel administrativo</p>
          <h1>Seu evento</h1>
        </header>
        {eventState.status === 'loading' && <p className={styles.state} role="status">Carregando seu evento…</p>}
        {eventState.status === 'error' && (
          <div className={styles.state}><p>Os dados do evento não estão disponíveis agora.</p><button className={styles.retry} onClick={retry} type="button">Tentar novamente</button></div>
        )}
        {eventState.status === 'loaded' && !event && (
          <section id="evento" className={styles.empty}>
            <CalendarDays size={32} strokeWidth={1.25} aria-hidden="true" />
            <h2>Nenhum evento cadastrado</h2>
            <p>Quando um evento for cadastrado, os dados aparecerão aqui.</p>
          </section>
        )}
        {event && (
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
          </>
        )}
      </main>
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}
    </div>
  );
}
