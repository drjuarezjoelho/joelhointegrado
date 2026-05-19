import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "lz_session";

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  uid: number;
  v: 1;
};

function getSecretKey(): Uint8Array {
  const s = process.env.LINHA_ZERO_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!s || s.length < 32)) {
    throw new Error(
      "LINHA_ZERO_SESSION_SECRET must be set (≥32 characters) in production."
    );
  }
  const raw = s ?? "development-only-linha-zero-secret-32chars!!";
  return new TextEncoder().encode(raw);
}

export async function signSessionToken(uid: number): Promise<string> {
  return new SignJWT({ v: 1 } satisfies Pick<SessionPayload, "v">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(uid))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token?.length) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    if (!sub) return null;
    const uid = Number.parseInt(sub, 10);
    if (!Number.isFinite(uid) || uid < 1) return null;
    return { uid, v: 1 };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_MS,
  };
}
