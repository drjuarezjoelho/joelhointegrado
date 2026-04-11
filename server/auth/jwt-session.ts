import { SignJWT, jwtVerify } from "jose";

/** Keep in sync with `src/const.ts` (COOKIE_NAME). */
export const SESSION_COOKIE_NAME = "cij_session";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Payload stored in the session cookie (server-only verification). */
export type SessionPayload = {
  uid: number;
  v: 1;
};

function getSecretKey(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!s || s.length < 32)) {
    throw new Error(
      "SESSION_SECRET must be set (≥32 characters) in production."
    );
  }
  const raw = s ?? "development-only-insecure-secret-min-32-chars!!";
  return new TextEncoder().encode(raw);
}

export async function signSessionToken(uid: number): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ v: 1 } satisfies Pick<SessionPayload, "v">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(uid))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token?.length) return null;
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const sub = payload.sub;
    if (!sub) return null;
    const uid = Number.parseInt(sub, 10);
    if (!Number.isFinite(uid) || uid < 1) return null;
    return { uid, v: 1 };
  } catch {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE_NAME;

export function sessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_MS,
  };
}
