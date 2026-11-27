import { isAxiosError } from 'axios';

export function getAdminLoginError(error: unknown): string {
  if (!isAxiosError(error)) return 'Não foi possível acessar o painel. Tente novamente.';

  if (!error.response) {
    return 'Não foi possível conectar. Verifique sua conexão e tente novamente.';
  }

  switch (error.response.status) {
    case 401:
      return 'Usuário ou senha inválidos. Confira os dados e tente novamente.';
    case 403:
      return 'Não foi possível validar o acesso. Atualize a página e tente novamente.';
    case 429:
      return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    default:
      return 'O acesso está temporariamente indisponível. Tente novamente mais tarde.';
  }
}
