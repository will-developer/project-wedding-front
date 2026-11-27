import { isAxiosError } from 'axios';

const messages: Record<string, string> = {
  INVALID_INVITATION_CODE: 'Código inválido. Verifique o código no seu convite físico.',
  INVALID_LOGIN_PAYLOAD: 'Confira o código do convite e tente novamente.',
  TURNSTILE_REQUIRED: 'Conclua a verificação de segurança para continuar.',
  TOO_MANY_ATTEMPTS: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  LOGIN_UNAVAILABLE: 'O acesso está temporariamente indisponível. Tente novamente mais tarde.',
  TURNSTILE_UNAVAILABLE: 'A verificação de segurança está indisponível. Tente novamente mais tarde.',
};

export interface GuestLoginChallenge {
  siteKey: string;
  action: string;
}

export function getGuestLoginChallenge(error: unknown): GuestLoginChallenge | null {
  if (!isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (typeof data !== 'object' || data === null) return null;
  if (!('turnstileRequired' in data) || data.turnstileRequired !== true) return null;
  if (!('siteKey' in data) || typeof data.siteKey !== 'string' || !data.siteKey.trim()) return null;
  if (!('action' in data) || typeof data.action !== 'string' || !data.action.trim()) return null;
  return { siteKey: data.siteKey, action: data.action };
}

export function getGuestLoginError(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'Não foi possível acessar o convite. Tente novamente.';
  }

  if (!error.response) {
    return 'Não foi possível conectar. Verifique sua conexão e tente novamente.';
  }

  const data: unknown = error.response.data;
  if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string') {
    const message = Object.hasOwn(messages, data.code) ? messages[data.code] : undefined;
    if (message) return message;
  }

  if (error.response.status === 403) {
    return 'Não foi possível validar o acesso. Atualize a página e tente novamente.';
  }

  return 'Não foi possível acessar o convite. Tente novamente mais tarde.';
}
