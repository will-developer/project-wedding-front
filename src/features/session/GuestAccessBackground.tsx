import { useEffect, useRef, useState } from 'react';
import beachPoster from '../../assets/guest-access/beach-poster.jpg';
import beachVideo from '../../assets/guest-access/beach.mp4';
import styles from './GuestAccessBackground.module.css';

export function GuestAccessBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [failed, setFailed] = useState(false);
  const wantsPlayback = useRef(enabled);
  const pausedByUser = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resume = () => {
      if (enabled && wantsPlayback.current && !document.hidden) {
        void video.play().catch(() => setPlaying(false));
      }
    };

    const handleVisibility = () => {
      if (document.hidden) video.pause();
      else resume();
    };

    const handleMotion = (event: MediaQueryListEvent) => {
      wantsPlayback.current = !event.matches && !pausedByUser.current;
      if (wantsPlayback.current) {
        setEnabled(true);
        resume();
      } else {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    motion.addEventListener('change', handleMotion);
    resume();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      motion.removeEventListener('change', handleMotion);
      video.pause();
    };
  }, [enabled, failed]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      pausedByUser.current = true;
      wantsPlayback.current = false;
      video.pause();
      return;
    }

    pausedByUser.current = false;
    wantsPlayback.current = true;
    if (!enabled) setEnabled(true);
    else void video.play().catch(() => setPlaying(false));
  }

  const action = playing ? 'Pausar vídeo de fundo' : 'Reproduzir vídeo de fundo';

  return (
    <>
      <img className={styles.media} src={beachPoster} alt="" fetchPriority="high" />
      {!failed && (
        <video
          ref={videoRef}
          className={`${styles.media} ${styles.video} ${hasPlayed ? styles.visible : ''}`}
          src={enabled ? beachVideo : undefined}
          poster={beachPoster}
          muted
          loop
          playsInline
          preload={enabled ? 'metadata' : 'none'}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          onPlay={() => setPlaying(true)}
          onPlaying={() => setHasPlayed(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            wantsPlayback.current = false;
            setFailed(true);
            setPlaying(false);
          }}
        />
      )}
      {!failed && (
        <button className={styles.control} type="button" onClick={togglePlayback} aria-label={action}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing ? <path d="M9 5v14M15 5v14" /> : <path d="m8 5 10 7-10 7Z" />}
          </svg>
        </button>
      )}
    </>
  );
}
