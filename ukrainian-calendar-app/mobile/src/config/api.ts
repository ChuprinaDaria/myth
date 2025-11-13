export const API_BASE_URL = 'http://192.168.1.13:3000/api';

export function getApiBaseUrl(): string | null {
  if (API_BASE_URL.includes('YOUR_IP')) return null;
  return API_BASE_URL;
}


