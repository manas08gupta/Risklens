const trimSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimSlash(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_BASE_URL || "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error?.message || "RiskLens API request failed.");
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

export function getApiModeLabel() {
  if (!API_BASE_URL) return "same-origin API";
  return API_BASE_URL;
}
