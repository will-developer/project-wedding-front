import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { NumericFormat } from 'react-number-format';
import type { CreateGiftRequest, GiftResponse, UpdateGiftRequest } from './gifts.types';
import { getGiftImageError, parseGiftPrice } from './giftValidation';
import styles from './Gifts.module.css';

interface GiftFormCommonProps {
  pending: boolean;
  onCancel: () => void;
  onError: (message: string) => void;
}

type GiftFormProps = GiftFormCommonProps & (
  | { gift?: undefined; onSubmit: (request: CreateGiftRequest) => void }
  | { gift: GiftResponse; onSubmit: (request: UpdateGiftRequest) => void }
);

export function GiftForm(props: GiftFormProps) {
  const { gift, pending, onCancel, onError } = props;
  const [name, setName] = useState(gift?.name ?? '');
  const [description, setDescription] = useState(gift?.description ?? '');
  const [imageUrl, setImageUrl] = useState(gift?.imageUrl ?? '');
  const [price, setPrice] = useState(gift?.price.toString() ?? '');
  const [quantity, setQuantity] = useState('1');
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    function fail(field: string, message: string) {
      form.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();
      onError(message);
    }
    if (!name.trim()) { fail('giftName', 'Preencha o nome do presente.'); return; }
    if (name.length > 160) { fail('giftName', 'O nome do presente deve ter até 160 caracteres.'); return; }
    const imageError = getGiftImageError(imageUrl);
    if (imageError) { fail('giftImage', imageError); return; }
    const parsedPrice = parseGiftPrice(price);
    if (parsedPrice === null) { fail('giftPrice', 'Informe um preço entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais. Ex.: 150,00.'); return; }
    const request = { name: name.trim(), description: description.trim() || null, imageUrl: imageUrl.trim() || null, price: parsedPrice };
    if (props.gift) {
      props.onSubmit(request);
    } else {
      const parsedQuantity = Number(quantity);
      if (!/^\d+$/.test(quantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 2147483647) {
        fail('giftQuantity', 'Informe uma quantidade inteira entre 1 e 2.147.483.647.');
        return;
      }
      props.onSubmit({ ...request, totalQuantity: parsedQuantity });
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
      <h3 ref={heading} tabIndex={-1}>{gift ? 'Editar presente' : 'Novo presente'}</h3>
      <fieldset className={styles.fields} disabled={pending}>
        <legend className={styles.hidden}>Dados do presente</legend>
        <label className={styles.field} htmlFor="gift-name"><span>Nome do presente</span><input id="gift-name" name="giftName" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required /></label>
        <label className={styles.field} htmlFor="gift-description"><span>Descrição <small>(opcional)</small></span><textarea id="gift-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label>
        <label className={styles.field} htmlFor="gift-image"><span>Link da imagem <small>(opcional)</small></span><input id="gift-image" name="giftImage" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://" aria-describedby="gift-image-hint" /><small id="gift-image-hint">Use o link direto de uma imagem disponível na internet.</small></label>
        <div className={styles.columns}>
          <label className={styles.field} htmlFor="gift-price"><span>Preço (R$)</span><NumericFormat
            id="gift-price" name="giftPrice" inputMode="decimal" value={price}
            valueIsNumericString thousandSeparator="." decimalSeparator="," decimalScale={2}
            fixedDecimalScale allowNegative={false}
            onValueChange={({ value }) => setPrice(value)}
            isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 99999999.99}
            placeholder="150,00" required
          /></label>
          {!gift && <label className={styles.field} htmlFor="gift-quantity"><span>Quantidade total</span><input id="gift-quantity" name="giftQuantity" type="number" inputMode="numeric" min={1} max={2147483647} step={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>}
        </div>
        {gift && <p className={styles.availability}>{gift.availableQuantity} de {gift.totalQuantity} disponíveis</p>}
      </fieldset>
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={onCancel} disabled={pending}>Cancelar</button><button type="submit" className={styles.primary} disabled={pending}>{pending ? 'Salvando…' : gift ? 'Salvar alterações' : 'Cadastrar presente'}</button></div>
    </form>
  );
}
