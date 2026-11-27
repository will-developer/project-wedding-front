import { ArrowUp, SkipForward } from 'lucide-react';
import { useRef } from 'react';
import type { PointerEvent } from 'react';
import envelopeLeft from '../../assets/guest-access/envelope-left.png';
import envelopeRight from '../../assets/guest-access/envelope-right.png';
import envelopeLining from '../../assets/guest-access/envelope-lining.png';
import envelopeSeal from '../../assets/guest-access/envelope-seal.png';
import styles from './GuestEnvelopeCover.module.css';

interface GuestEnvelopeCoverProps {
  onOpen: () => void;
}

interface GestureStart {
  pointerId: number;
  x: number;
  y: number;
}

export function GuestEnvelopeCover({ onOpen }: GuestEnvelopeCoverProps) {
  const gesture = useRef<GestureStart | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const verticalDistance = start.y - event.clientY;
    const horizontalDistance = Math.abs(start.x - event.clientX);
    if (verticalDistance >= 64 && verticalDistance > horizontalDistance) onOpen();
  }

  return (
    <main
      className={styles.cover}
      aria-labelledby="envelope-title"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { gesture.current = null; }}
    >
      <h1 className={styles.hiddenTitle} id="envelope-title">O convite de Anna e William</h1>
      <div className={styles.scene} aria-hidden="true">
        <img className={styles.paper} src={envelopeLining} alt="" draggable={false} fetchPriority="high" />
        <div className={`${styles.flap} ${styles.right}`}>
          <img className={styles.art} src={envelopeRight} alt="" draggable={false} />
        </div>
        <div className={`${styles.flap} ${styles.left}`}>
          <img className={styles.art} src={envelopeLeft} alt="" draggable={false} />
          <div className={styles.seal}>
            <img src={envelopeSeal} alt="" draggable={false} />
            <span className={styles.monogram} />
          </div>
        </div>
      </div>
      <button className={styles.open} type="button" onClick={onOpen} aria-label="Abrir convite. Arraste para cima ou toque aqui.">
        <span className={styles.gesture} aria-hidden="true">
          <ArrowUp size={26} strokeWidth={1.25} />
        </span>
        <span>Arraste para cima</span>
      </button>
      <button className={styles.skip} type="button" onClick={onOpen} aria-label="Pular abertura">
        <SkipForward size={20} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      </button>
    </main>
  );
}
