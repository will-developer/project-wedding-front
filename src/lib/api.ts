import axios from 'axios'

interface CsrfResponse {
  headerName: string;
  token: string;
}

const methodsRequiringCsrf = new Set(['post', 'put', 'patch', 'delete']);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (methodsRequiringCsrf.has(config.method?.toLowerCase() ?? 'get')) {
    const { data } = await api.get<CsrfResponse>('/api/auth/csrf');
    config.headers.set(data.headerName, data.token);
  }

  return config;
});
