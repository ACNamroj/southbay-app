const API_BASE_URL = process.env.BASE_URL ?? '';

export const withBaseUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
};
