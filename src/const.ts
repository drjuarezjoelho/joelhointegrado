/** Cookie name for auth/session (e.g. used by OAuth callback). */
export const COOKIE_NAME = "cij_session";

/** One year in milliseconds (e.g. for cookie maxAge). */
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Message returned by API when the user is not authenticated (401). */
export const UNAUTHED_ERR_MSG = "UNAUTHORIZED";

/**
 * Generate login URL at runtime so redirect URI reflects the current origin.
 * Uses OAuth portal when VITE_OAUTH_PORTAL_URL and VITE_APP_ID are set; otherwise returns "/".
 */
export function getLoginUrl(): string {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    return "/";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
}
