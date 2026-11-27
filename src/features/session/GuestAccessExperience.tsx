import { useCallback, useState } from 'react';
import { GuestEnvelopeCover } from './GuestEnvelopeCover';
import { GuestLoginPage } from './GuestLoginPage';
import { GuestOpeningMessages } from './GuestOpeningMessages';
import styles from './GuestAccessExperience.module.css';

type AccessStage = 'cover' | 'messages' | 'handoff' | 'login';

export function GuestAccessExperience() {
  const [stage, setStage] = useState<AccessStage>('cover');
  const showLogin = useCallback(() => setStage('login'), []);
  const showMessages = useCallback(() => {
    setStage(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'login' : 'messages');
  }, []);
  const finishMessages = useCallback(() => setStage('handoff'), []);

  return (
    <div className={styles.experience}>
      {stage === 'cover' && <GuestEnvelopeCover onOpen={showMessages} onSkip={showLogin} />}
      {(stage === 'handoff' || stage === 'login') && (
        <div inert={stage === 'handoff'}>
          <GuestLoginPage active={stage === 'login'} />
        </div>
      )}
      {(stage === 'messages' || stage === 'handoff') && (
        <GuestOpeningMessages
          leaving={stage === 'handoff'}
          onComplete={stage === 'handoff' ? showLogin : finishMessages}
        />
      )}
    </div>
  );
}
