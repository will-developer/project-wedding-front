import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Gift, Plus } from 'lucide-react';
import { GiftForm } from './GiftForm';
import { createGift, getGifts } from './gifts.api';
import type { CreateGiftRequest, GiftResponse } from './gifts.types';
import { getGiftImageError } from './giftValidation';
import styles from './Gifts.module.css';

interface GiftsProps {
  eventId: string;
  onError: (message: string) => void;
  onAccessDenied: (status: 401 | 403) => void;
  onSavingChange: (pending: boolean) => void;
}

type GiftsState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; gifts: GiftResponse[] };
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
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
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

  async function save(request: CreateGiftRequest) {
    if (pending.current || state.status !== 'loaded') return;
    pending.current = true;
    setSaving(true);
    onSavingChange(true);
    onError('');
    try {
      const gift = await createGift(eventId, request);
      setState((current) => current.status === 'loaded' ? { status: 'loaded', gifts: [...current.gifts, gift].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')) } : current);
      setCreating(false);
      setCreated(true);
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) onAccessDenied(401);
      else if (status === 400) onError('Confira o nome, o preço, a quantidade e o link da imagem do presente.');
      else if (status === 403) onError('Não foi possível validar o cadastro. Recarregue a página e tente novamente.');
      else if (status === 404) onError('O evento não foi encontrado. Recarregue a página para conferir.');
      else onError('Não foi possível confirmar o cadastro do presente. Recarregue a página e confira a lista antes de tentar novamente.');
    } finally {
      pending.current = false;
      setSaving(false);
      onSavingChange(false);
    }
  }

  return (
    <section id="presentes" className={styles.section} aria-labelledby="gifts-heading">
      <header className={styles.heading}><div><h2 id="gifts-heading">Lista de presentes</h2><p>Cadastre os presentes que estarão disponíveis para seus convidados.</p></div>
        {state.status === 'loaded' && !creating && <button className={styles.primary} type="button" onClick={() => { onError(''); setCreated(false); setCreating(true); }}><Plus size={16} aria-hidden="true" />Cadastrar presente</button>}
      </header>
      {created && <p role="status">Presente cadastrado.</p>}
      {state.status === 'loading' && <p role="status">Carregando presentes…</p>}
      {state.status === 'error' && <div><p>A lista de presentes não está disponível agora.</p><button type="button" className={styles.secondary} onClick={() => { onError(''); setState({ status: 'loading' }); setAttempt((value) => value + 1); }}>Tentar novamente</button></div>}
      {creating && <GiftForm pending={saving} onSubmit={save} onError={onError} onCancel={() => { setCreating(false); onError(''); }} />}
      {state.status === 'loaded' && !state.gifts.length && !creating && <div className={styles.empty}><Gift size={28} strokeWidth={1.25} aria-hidden="true" /><h3>O primeiro presente</h3><p>Comece com um nome, um valor e a quantidade disponível.</p></div>}
      {state.status === 'loaded' && state.gifts.length > 0 && <ul className={styles.list}>{state.gifts.map((gift) => <li className={styles.gift} key={gift.id}>
        <GiftImage key={gift.imageUrl} url={gift.imageUrl} />
        <div className={styles.details}><h3>{gift.name}</h3>{gift.description && <p className={styles.description}>{gift.description}</p>}<strong className={styles.price}>{currency.format(gift.price)}</strong><p className={styles.availability}>{gift.availableQuantity} de {gift.totalQuantity} disponíveis <span>· {gift.active ? 'Ativo' : 'Inativo'}</span></p></div>
      </li>)}</ul>}
    </section>
  );
}
