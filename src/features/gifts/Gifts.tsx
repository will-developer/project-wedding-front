import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Gift, Pencil, Plus } from 'lucide-react';
import { GiftForm } from './GiftForm';
import { createGift, getGifts, setGiftActive, updateGift } from './gifts.api';
import type { GiftResponse } from './gifts.types';
import { getGiftImageError } from './giftValidation';
import styles from './Gifts.module.css';

interface GiftsProps {
  eventId: string;
  onError: (message: string) => void;
  onAccessDenied: (status: 401 | 403) => void;
  onSavingChange: (pending: boolean) => void;
}

type GiftsState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; gifts: GiftResponse[] };
type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; gift: GiftResponse };
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function GiftImage({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.image}>{url && !failed && !getGiftImageError(url)
    ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : <Gift size={28} strokeWidth={1.25} aria-hidden="true" />}</div>;
}

export function Gifts({ eventId, onError, onAccessDenied, onSavingChange }: GiftsProps) {
  const [state, setState] = useState<GiftsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState<FormState>({ mode: 'closed' });
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    void getGifts(eventId, controller.signal).then((gifts) => {
      if (!controller.signal.aborted) setState({ status: 'loaded', gifts });
    }, (error: unknown) => {
      if (controller.signal.aborted) return;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) { onAccessDenied(status); return; }
      setState({ status: 'error' });
      onError('Não foi possível carregar os presentes. Tente novamente.');
    });
    return () => controller.abort();
  }, [eventId, attempt, onError, onAccessDenied]);

  async function mutate(action: () => Promise<GiftResponse>, message: string, giftId?: string) {
    if (pending.current || state.status !== 'loaded') return;
    pending.current = true;
    setSaving(true);
    setUpdatingId(giftId ?? null);
    onSavingChange(true);
    onError('');
    try {
      const gift = await action();
      setState((current) => current.status === 'loaded' ? { status: 'loaded', gifts: [...current.gifts.filter((item) => item.id !== gift.id), gift].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')) } : current);
      setForm({ mode: 'closed' });
      setConfirmation(message);
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) onAccessDenied(401);
      else if (status === 400) onError('Confira o nome, o preço, a quantidade e o link da imagem do presente.');
      else if (status === 403) onError('Não foi possível validar a alteração. Recarregue a página e tente novamente.');
      else if (status === 404) onError('O evento ou presente não foi encontrado. Recarregue a página para conferir.');
      else onError('Não foi possível confirmar o salvamento do presente. Recarregue a página e confira a lista antes de tentar novamente.');
    } finally {
      pending.current = false;
      setSaving(false);
      setUpdatingId(null);
      onSavingChange(false);
    }
  }

  function cancel() {
    setForm({ mode: 'closed' });
    onError('');
  }

  return (
    <section id="presentes" className={styles.section} aria-labelledby="gifts-heading">
      <header className={styles.heading}><div><h2 id="gifts-heading">Lista de presentes</h2><p>Cadastre os presentes que estarão disponíveis para seus convidados.</p></div>
        {state.status === 'loaded' && form.mode === 'closed' && <button className={styles.primary} type="button" disabled={saving} onClick={() => { onError(''); setConfirmation(null); setForm({ mode: 'create' }); }}><Plus size={16} aria-hidden="true" />Cadastrar presente</button>}
      </header>
      {confirmation && <p role="status">{confirmation}</p>}
      {state.status === 'loading' && <p role="status">Carregando presentes…</p>}
      {state.status === 'error' && <div><p>A lista de presentes não está disponível agora.</p><button type="button" className={styles.secondary} onClick={() => { onError(''); setState({ status: 'loading' }); setAttempt((value) => value + 1); }}>Tentar novamente</button></div>}
      {form.mode === 'create' && <GiftForm key="create" pending={saving} onSubmit={(request) => void mutate(() => createGift(eventId, request), 'Presente cadastrado.')} onError={onError} onCancel={cancel} />}
      {form.mode === 'edit' && <GiftForm key={form.gift.id} gift={form.gift} pending={saving} onSubmit={(request) => void mutate(() => updateGift(eventId, form.gift.id, request), 'Alterações salvas.')} onError={onError} onCancel={cancel} />}
      {state.status === 'loaded' && !state.gifts.length && form.mode === 'closed' && <div className={styles.empty}><Gift size={28} strokeWidth={1.25} aria-hidden="true" /><h3>O primeiro presente</h3><p>Comece com um nome, um valor e a quantidade disponível.</p></div>}
      {state.status === 'loaded' && state.gifts.length > 0 && <ul className={styles.list}>{state.gifts.map((gift) => <li className={styles.gift} key={gift.id} aria-busy={updatingId === gift.id}>
        <GiftImage key={gift.imageUrl} url={gift.imageUrl} />
        <div className={styles.details}><h3>{gift.name}</h3>{gift.description && <p className={styles.description}>{gift.description}</p>}<strong className={styles.price}>{currency.format(gift.price)}</strong><p className={styles.availability}>{gift.availableQuantity} de {gift.totalQuantity} disponíveis <span className={gift.active ? styles.active : styles.inactive}>· {gift.active ? 'Ativo' : 'Inativo'}</span></p>
          <div className={styles.giftActions}>
            <button type="button" className={styles.secondary} disabled={saving || form.mode !== 'closed'} aria-label={`Editar presente ${gift.name}`} onClick={() => { onError(''); setConfirmation(null); setForm({ mode: 'edit', gift }); }}><Pencil size={15} aria-hidden="true" />Editar</button>
            <button type="button" className={styles.secondary} disabled={saving || form.mode !== 'closed'} aria-label={`${gift.active ? 'Desativar' : 'Ativar'} presente ${gift.name}`} onClick={() => { setConfirmation(null); void mutate(() => setGiftActive(eventId, gift.id, !gift.active), `${gift.name}: ${gift.active ? 'desativado' : 'ativado'}.`, gift.id); }}>{updatingId === gift.id ? 'Atualizando…' : gift.active ? 'Desativar' : 'Ativar'}</button>
          </div>
        </div>
      </li>)}</ul>}
    </section>
  );
}
