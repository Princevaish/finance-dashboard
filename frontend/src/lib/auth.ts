const KEY = "finance_access_token";

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, token);
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") return localStorage.getItem(KEY);
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
};

export type UserRole = "admin" | "analyst" | "viewer" | null;

export const getUserRole = (): UserRole => {
  const token = getToken();
  if (!token) return null;
  try {
    // JWT payload is the second segment, base64url encoded
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.role as UserRole) ?? null;
  } catch {
    return null;
  }
};

export const getUserEmail = (): string | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? null;
  } catch {
    return null;
  }
};