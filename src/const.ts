/** Cookie name for auth/session (OAuth callback + JWT session). */
export const COOKIE_NAME = "cij_session";

/** One year in milliseconds (e.g. for cookie maxAge). */
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Message returned by API when the user is not authenticated (401). */
export const UNAUTHED_ERR_MSG = "UNAUTHORIZED";

/**
 * True when the client build includes a Google OAuth Web Client ID.
 * Used only to mostrar o botão "Entrar com conta" (o servidor valida tudo).
 */
export function isOAuthConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.length);
}

/**
 * URL absoluta para iniciar OAuth Google (mesma origem → cookie de sessão).
 */
export function getLoginUrl(): string {
  if (typeof window === "undefined") return "/api/oauth/google";
  return `${window.location.origin}/api/oauth/google`;
}
