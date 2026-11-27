interface TurnstileOptions {
  sitekey: string;
  action: string;
  theme: 'light';
  size: 'normal';
  language: 'pt-br';
  'response-field': false;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
  'timeout-callback': () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string | undefined;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | undefined;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (loading) return loading;

  if (window.turnstile) return Promise.resolve(window.turnstile);

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(fail, 15000);

    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      loading = undefined;
      reject(new Error('Turnstile unavailable'));
    }

    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      const api = window.turnstile;
      if (!api) {
        fail();
        return;
      }
      window.clearTimeout(timeout);
      resolve(api);
    };
    document.head.append(script);
  });

  return loading;
}
