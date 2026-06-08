const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const parseJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const apiRequest = async (path, options = {}) => {
  const token = options.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};
