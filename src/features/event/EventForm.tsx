import { useEffect, useRef, useState } from 'react';
import type { FormEvent, HTMLInputTypeAttribute } from 'react';
import type { EventRequest, EventResponse } from './event.types';
import { toEventDateTime, toEventInstant } from './eventDateTime';
import { getMapLinkError } from './mapLinkValidation';
import styles from './EventForm.module.css';

interface EventFormProps {
  event?: EventResponse;
  pending: boolean;
  onSubmit: (request: EventRequest, receptionAtCeremonyLocation: boolean) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

interface EventFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  maxLength?: number;
}

function EventField({ name, label, value, onChange, type = 'text', maxLength }: EventFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={`event-${name}`}>{label}</label>
      <input
        id={`event-${name}`} name={name} type={type} value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (type !== 'date' || !next || /^\d{4}-\d{2}-\d{2}$/.test(next)) onChange(next);
        }}
        maxLength={type === 'url' ? undefined : maxLength}
        min={type === 'date' ? '0001-01-01' : undefined}
        max={type === 'date' ? '9999-12-31' : undefined}
        step={type === 'time' ? 60 : undefined}
        required
      />
    </div>
  );
}

export function EventForm({ event, pending, onSubmit, onCancel, onError }: EventFormProps) {
  const initialDateTime = event ? toEventDateTime(event.eventDate) : '';
  const [draft, setDraft] = useState({
    title: event?.title ?? '',
    eventDate: initialDateTime.slice(0, 10),
    eventTime: initialDateTime.slice(11, 16),
    ceremonyLocation: event?.ceremonyLocation ?? '',
    ceremonyMapsUrl: event?.ceremonyMapsUrl ?? '',
    receptionLocation: event?.receptionLocation ?? '',
    receptionMapsUrl: event?.receptionMapsUrl ?? '',
    rsvpDeadline: event?.rsvpDeadline ?? '',
  });
  const [sameLocation, setSameLocation] = useState(!event || (event.receptionLocation === null && event.receptionMapsUrl === null));
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, []);

  function change(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (pending) return;
    const inputs = submitEvent.currentTarget.querySelectorAll<HTMLInputElement>('input:not([type="checkbox"])');
    for (const input of inputs) {
      const label = input.labels?.[0]?.textContent ?? 'obrigatório';
      let message: string | null = null;
      if (input.type === 'url') message = getMapLinkError(input.value, label);
      else if (input.validity.badInput) message = `Complete o campo “${label}” com uma data ou horário válido.`;
      else if (!input.value.trim()) message = `Preencha o campo “${label}”.`;
      else if (input.maxLength > 0 && input.value.length > input.maxLength) message = `O campo “${label}” aceita até ${input.maxLength} caracteres.`;
      else if (!input.validity.valid) message = `Informe uma data ou horário válido no campo “${label}”.`;
      if (message) {
        input.focus();
        onError(message);
        return;
      }
    }
    try {
      onSubmit({
        title: draft.title.trim(),
        eventDate: event && `${draft.eventDate}T${draft.eventTime}` === initialDateTime.slice(0, 16)
          ? event.eventDate
          : toEventInstant(`${draft.eventDate}T${draft.eventTime}`),
        ceremonyLocation: draft.ceremonyLocation.trim(),
        ceremonyMapsUrl: draft.ceremonyMapsUrl.trim(),
        receptionLocation: sameLocation ? null : draft.receptionLocation.trim(),
        receptionMapsUrl: sameLocation ? null : draft.receptionMapsUrl.trim(),
        rsvpDeadline: draft.rsvpDeadline,
      }, sameLocation);
    } catch {
      onError('Confira a data e o horário do evento.');
    }
  }

  return (
    <form id="evento" className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={pending}>
      <h2 ref={titleRef} className={styles.formTitle} tabIndex={-1}>Dados do evento</h2>
      <fieldset disabled={pending} className={styles.fields}>
        <legend className={styles.hidden}>Informações principais</legend>
        <EventField name="title" label="Nome do evento" value={draft.title} onChange={(value) => change('title', value)} maxLength={160} />
        <div className={styles.columns}>
          <EventField name="eventDate" label="Data do evento" type="date" value={draft.eventDate} onChange={(value) => change('eventDate', value)} />
          <EventField name="eventTime" label="Horário de Brasília" type="time" value={draft.eventTime} onChange={(value) => change('eventTime', value)} />
          <EventField name="rsvpDeadline" label="Prazo para confirmar presença" type="date" value={draft.rsvpDeadline} onChange={(value) => change('rsvpDeadline', value)} />
        </div>
      </fieldset>
      <fieldset disabled={pending} className={styles.fields}>
        <legend>Cerimônia</legend>
        <EventField name="ceremonyLocation" label="Local da cerimônia" value={draft.ceremonyLocation} onChange={(value) => change('ceremonyLocation', value)} maxLength={200} />
        <EventField name="ceremonyMapsUrl" label="Link do mapa da cerimônia" type="url" value={draft.ceremonyMapsUrl} onChange={(value) => change('ceremonyMapsUrl', value)} maxLength={2048} />
      </fieldset>
      <fieldset disabled={pending} className={styles.fields} id="locais">
        <legend>Recepção</legend>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={sameLocation} onChange={(event) => setSameLocation(event.target.checked)} />
          A recepção será no mesmo local da cerimônia
        </label>
        {!sameLocation && (
          <>
            <EventField name="receptionLocation" label="Local da recepção" value={draft.receptionLocation} onChange={(value) => change('receptionLocation', value)} maxLength={200} />
            <EventField name="receptionMapsUrl" label="Link do mapa da recepção" type="url" value={draft.receptionMapsUrl} onChange={(value) => change('receptionMapsUrl', value)} maxLength={2048} />
          </>
        )}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={pending}>Cancelar</button>
        <button type="submit" className={styles.save} disabled={pending}>{pending ? (event ? 'Salvando…' : 'Criando…') : (event ? 'Salvar alterações' : 'Criar evento')}</button>
      </div>
    </form>
  );
}
