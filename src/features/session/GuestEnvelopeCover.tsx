import { ArrowUp, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import envelopeLeft from '../../assets/guest-access/envelope-left.png';
import envelopeRight from '../../assets/guest-access/envelope-right.png';
import envelopeLining from '../../assets/guest-access/envelope-lining.png';
import envelopeSeal from '../../assets/guest-access/envelope-seal.png';
import styles from './GuestEnvelopeCover.module.css';

interface GuestEnvelopeCoverProps {
  onOpen: () => void;
  onSkip: () => void;
}

interface GestureStart {
  pointerId: number;
  x: number;
  y: number;
  startedOnButton: boolean;
}

export function GuestEnvelopeCover({ onOpen, onSkip }: GuestEnvelopeCoverProps) {
  const gesture = useRef<GestureStart | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [opening, setOpening] = useState(false);
  const peelAngle = useRef(0);

  useEffect(() => {
    if (!opening) return;
    const root = rootRef.current;
    if (!root) return;
    let active = true;
    const animations: Animation[] = [];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const complete = () => { if (active) onOpen(); };
    const handleMotion = () => { if (motion.matches) complete(); };

    const animate = (className: string, frames: Keyframe[], duration: number, delay = 0, easing = 'linear') => {
      const target = root.querySelector<HTMLElement>(`.${className}`);
      if (target) animations.push(target.animate(frames, {
        duration: duration * 0.52,
        delay: delay * 0.52,
        easing,
        fill: 'both',
      }));
    };

    motion.addEventListener('change', handleMotion);
    if (motion.matches) {
      complete();
    } else {
      animate(styles.left, [
        { transform: `rotateY(${-peelAngle.current}deg)`, easing: 'ease-in' },
        { transform: 'rotateY(-4deg)', offset: 300 / 2900, easing: 'linear' },
        { transform: 'rotateY(-30deg)', offset: 1000 / 2900, easing: 'linear' },
        { transform: 'rotateY(-65deg)', offset: 2000 / 2900, easing: 'ease-out' },
        { transform: 'rotateY(-108deg)' },
      ], 2900);
      animate(styles.right, [
        { transform: 'rotateY(0deg)', easing: 'ease-in' },
        { transform: 'rotateY(8deg)', offset: 750 / 3200, easing: 'linear' },
        { transform: 'rotateY(34deg)', offset: 1750 / 3200, easing: 'linear' },
        { transform: 'rotateY(63deg)', offset: 2750 / 3200, easing: 'ease-out' },
        { transform: 'rotateY(108deg)' },
      ], 3200, 250);
      animate(`${styles.left} .${styles.art}`, [
        { filter: 'drop-shadow(1px 1px 2px #48351b38) saturate(.95) brightness(.967)' },
        { filter: 'drop-shadow(1px 1px 2px #48351b38) saturate(.95) brightness(.84)' },
      ], 2900, 0, 'ease-in');
      animate(`${styles.right} .${styles.art}`, [
        { filter: 'drop-shadow(-1px 1px 2px #48351b35) saturate(.95) brightness(.96)' },
        { filter: 'drop-shadow(-1px 1px 2px #48351b35) saturate(.95) brightness(.67)' },
      ], 3200, 250);
      animate(styles.topFold, [
        { transform: 'rotateX(0deg)', easing: 'ease-in' },
        { transform: 'rotateX(5deg)', offset: 0.15, easing: 'linear' },
        { transform: 'rotateX(47deg)', offset: 0.5, easing: 'ease-out' },
        { transform: 'rotateX(106deg)' },
      ], 2000, 2000);
      animate(styles.bottomFold, [
        { transform: 'rotateX(0deg)', easing: 'ease-in' },
        { transform: 'rotateX(-5deg)', offset: 0.15, easing: 'linear' },
        { transform: 'rotateX(-50deg)', offset: 0.5, easing: 'ease-out' },
        { transform: 'rotateX(-106deg)' },
      ], 2000, 2000);
      animate(styles.shade, [
        { opacity: 0 }, { opacity: 0.72, offset: 0.4 },
        { opacity: 0.25, offset: 0.7 }, { opacity: 0 },
      ], 4700);
      animate(styles.open, [{ opacity: 1 }, { opacity: 0 }], 220, 0, 'ease-out');
      void Promise.all(animations.map((animation) => animation.finished)).then(complete, complete);
    }

    return () => {
      active = false;
      motion.removeEventListener('change', handleMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, [opening, onOpen]);

  function requestOpen() {
    if (opening) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onOpen();
    else setOpening(true);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (opening || event.button !== 0 || !event.isPrimary) return;
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button?.classList.contains(styles.skip)) return;
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedOnButton: button?.classList.contains(styles.open) ?? false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add(styles.dragging);
  }

  function resetGesture() {
    gesture.current = null;
    peelAngle.current = 0;
    rootRef.current?.style.removeProperty('--peel-angle');
    rootRef.current?.classList.remove(styles.dragging);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId || opening) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    peelAngle.current = Math.min(7, Math.max(0, start.y - event.clientY) * 0.035);
    event.currentTarget.style.setProperty('--peel-angle', `${peelAngle.current}deg`);
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    gesture.current = null;
    event.currentTarget.classList.remove(styles.dragging);
    const verticalDistance = start.y - event.clientY;
    const horizontalDistance = Math.abs(start.x - event.clientX);
    const tappedButton = start.startedOnButton && Math.abs(verticalDistance) < 8 && horizontalDistance < 8;
    if ((verticalDistance >= 64 && verticalDistance > horizontalDistance) || tappedButton) requestOpen();
    else resetGesture();
  }

  return (
    <main
      ref={rootRef}
      className={`${styles.cover} ${opening ? styles.opening : ''}`}
      inert={opening}
      aria-labelledby="envelope-title"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerCancel={resetGesture}
    >
      <h1 className={styles.hiddenTitle} id="envelope-title">O convite de Anna e William</h1>
      <div className={styles.scene} aria-hidden="true">
        <img className={styles.paper} src={envelopeLining} alt="" draggable={false} fetchPriority="high" />
        <div className={styles.shade} />
        <div className={`${styles.innerFold} ${styles.topFold}`}>
          <div className={styles.innerPaper} style={{ backgroundImage: `url(${envelopeLining})` }} />
        </div>
        <div className={`${styles.innerFold} ${styles.bottomFold}`}>
          <div className={styles.innerPaper} style={{ backgroundImage: `url(${envelopeLining})` }} />
        </div>
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
      <button className={styles.open} type="button" onClick={requestOpen} aria-label="Abrir convite. Arraste para cima ou toque aqui.">
        <span className={styles.gesture} aria-hidden="true">
          <ArrowUp size={26} strokeWidth={1.25} />
        </span>
        <span className={styles.label}><span>Arraste para cima</span></span>
      </button>
      <button className={styles.skip} type="button" onClick={onSkip} aria-label="Pular abertura">
        <SkipForward size={20} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      </button>
    </main>
  );
}
