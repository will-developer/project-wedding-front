import beachPoster from '../../assets/guest-access/beach-poster.jpg';
import saveTheDate from '../../assets/guest-access/save-the-date.svg';
import weddingCrest from '../../assets/guest-access/wedding-crest.svg';
import styles from './GuestLoginPage.module.css';

export function GuestLoginPage() {
  return (
    <main className={styles.page} aria-labelledby="guest-access-title">
      <img className={styles.backdrop} src={beachPoster} alt="" fetchPriority="high" />

      <div className={styles.content}>
        <h1 className={styles.title} id="guest-access-title">
          <img src={saveTheDate} alt="Save the date" width="729" height="446" />
        </h1>

        <div className={styles.formPreview}>
          <label className={styles.hiddenLabel} htmlFor="invite-code">
            Código do convite
          </label>
          <input
            className={styles.codeInput}
            id="invite-code"
            name="code"
            type="text"
            placeholder="Seu código"
            aria-describedby="invite-code-hint"
            disabled
          />
          <p className={styles.hint} id="invite-code-hint">
            As 6 letras ou números que estão no seu convite.
          </p>
          <button className={styles.continueButton} type="button" disabled>
            Confirmar presença
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>

        <img
          className={styles.crest}
          src={weddingCrest}
          alt="Brasão de Anna e William"
          width="1739"
          height="2041"
        />
      </div>
    </main>
  );
}
