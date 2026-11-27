import { useEffect, useRef } from 'react';
import envelopeLining from '../../assets/guest-access/envelope-lining.png';
import styles from './GuestOpeningMessages.module.css';

const messages = [
  'Estamos contando os dias…',
  'Para celebrar com quem faz parte da nossa história.',
  'E você faz parte dela.',
];

const entryDuration = 1100;
const exitDuration = 700;
const holdDuration = 2100;

interface GuestOpeningMessagesProps {
  leaving: boolean;
  onComplete: () => void;
}

export function GuestOpeningMessages({ leaving, onComplete }: GuestOpeningMessagesProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let active = true;
    const animations: Animation[] = [];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const complete = () => { if (active) onComplete(); };
    const handleMotion = () => { if (motion.matches) complete(); };
    motion.addEventListener('change', handleMotion);

    const playMessages = () => {
      if (!active) return;
      let offset = 180;
      const lines = root.querySelectorAll<HTMLElement>(`.${styles.line}`);

      lines.forEach((line) => {
        const letters = Array.from(line.querySelectorAll<HTMLElement>(`.${styles.letter}`));
        const stagger = Math.min(18, 400 / Math.max(letters.length - 1, 1));
        const hold = entryDuration + stagger * (letters.length - 1) + holdDuration;
        const duration = hold + exitDuration + stagger * (letters.length - 1);
        animations.push(line.animate([{ visibility: 'visible' }, { visibility: 'visible' }], {
          duration: duration + 100,
          delay: offset,
        }));

        letters.forEach((letter, index) => {
          animations.push(letter.animate([
            { transform: 'translateY(100px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ], {
            duration: entryDuration,
            delay: offset + index * stagger,
            easing: 'cubic-bezier(.16,1,.3,1)',
            fill: 'both',
          }));
          animations.push(letter.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-100px)', opacity: 0 },
          ], {
            duration: exitDuration,
            delay: offset + hold + index * stagger,
            easing: 'cubic-bezier(.7,0,.84,0)',
            fill: 'forwards',
          }));
        });
        offset += duration + 100;
      });
      void Promise.all(animations.map((animation) => animation.finished)).then(complete, complete);
    };

    if (motion.matches) {
      complete();
    } else if (leaving) {
      animations.push(root.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 1200,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'forwards',
      }));
      const paper = root.querySelector<HTMLElement>(`.${styles.paper}`);
      if (paper) animations.push(paper.animate([
        { transform: 'translateX(-50%) scale(1)' },
        { transform: 'translateX(-50%) scale(1.045)' },
      ], { duration: 1200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }));
      void Promise.all(animations.map((animation) => animation.finished)).then(complete, complete);
    } else {
      titleRef.current?.focus({ preventScroll: true });
      void document.fonts.load('40px "Sloop Script"').then(playMessages, complete);
    }

    return () => {
      active = false;
      motion.removeEventListener('change', handleMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, [leaving, onComplete]);

  return (
    <main ref={rootRef} className={styles.page} aria-labelledby="opening-title" inert={leaving}>
      <img className={styles.paper} src={envelopeLining} alt="" draggable={false} />
      <h1 ref={titleRef} className={styles.hidden} id="opening-title" tabIndex={-1}>
        Uma mensagem de Anna e William
      </h1>
      <p className={styles.hidden}>{messages.join(' ')}</p>
      <div className={styles.stage} aria-hidden="true">
        {messages.map((message) => (
          <p className={styles.line} key={message}>
            {message.split(' ').map((word, wordIndex) => (
              <span key={`${wordIndex}-${word}`}>
                {wordIndex > 0 && ' '}
                <span className={styles.word}>
                  {Array.from(word).map((letter, index) => (
                    <span className={styles.letter} key={index}>{letter}</span>
                  ))}
                </span>
              </span>
            ))}
          </p>
        ))}
      </div>
    </main>
  );
}
