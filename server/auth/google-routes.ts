import type { Express, Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { getDb } from "../db";
import {
  sessionCookieName,
  sessionCookieOptions,
  signSessionToken,
} from "./jwt-session";
import { upsertGoogleUser } from "./upsert-google-user";

const OAUTH_STATE_COOKIE = "oauth_google_state";
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

function requireGoogleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function publicOrigin(req: Request): string {
  const proto = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host");
  return `${proto}://${host}`;
}

function redirectUri(req: Request): string {
  return `${publicOrigin(req)}/api/oauth/google/callback`;
}

export function mountGoogleOAuthRoutes(app: Express): void {
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    const cfg = requireGoogleConfig();
    if (!cfg) {
      res.status(503).send(
        "Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no servidor."
      );
      return;
    }

    const state = randomBytes(24).toString("hex");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60 * 1000,
    });

    const url = new URL(GOOGLE_AUTH);
    url.searchParams.set("client_id", cfg.clientId);
    url.searchParams.set("redirect_uri", redirectUri(req));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");

    res.redirect(url.toString());
  });

  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const cfg = requireGoogleConfig();
    if (!cfg) {
      res.status(503).send("Google OAuth não configurado.");
      return;
    }

    const err = req.query.error;
    if (typeof err === "string") {
      res
        .status(400)
        .send(`OAuth cancelado ou recusado: ${err}`);
      return;
    }

    const code = req.query.code;
    const state = req.query.state;
    const cookieState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;

    if (typeof code !== "string" || !code.length) {
      res.status(400).send("Código OAuth em falta.");
      return;
    }
    if (typeof state !== "string" || state !== cookieState) {
      res.status(400).send("Estado OAuth inválido.");
      return;
    }

    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

    const body = new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code",
    });

    let accessToken: string;
    try {
      const tokenRes = await fetch(GOOGLE_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!tokenRes.ok) {
        const t = await tokenRes.text();
        console.error("[oauth] token exchange failed", tokenRes.status, t);
        res.status(502).send("Falha ao obter token do Google.");
        return;
      }
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) {
        res.status(502).send("Resposta do Google sem access_token.");
        return;
      }
      accessToken = tokenJson.access_token;
    } catch (e) {
      console.error("[oauth] token fetch", e);
      res.status(502).send("Erro de rede ao contactar Google.");
      return;
    }

    let sub: string;
    let email: string | null = null;
    let name: string | null = null;
    try {
      const uiRes = await fetch(GOOGLE_USERINFO, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!uiRes.ok) {
        res.status(502).send("Falha ao obter perfil Google.");
        return;
      }
      const ui = (await uiRes.json()) as {
        sub?: string;
        email?: string;
        name?: string;
      };
      if (!ui.sub) {
        res.status(502).send("Perfil Google sem sub.");
        return;
      }
      sub = ui.sub;
      email = ui.email ?? null;
      name = ui.name ?? null;
    } catch (e) {
      console.error("[oauth] userinfo", e);
      res.status(502).send("Erro ao obter perfil.");
      return;
    }

    const db = getDb();
    const userId = upsertGoogleUser(db, sub, email, name);
    const token = await signSessionToken(userId);

    res.cookie(sessionCookieName, token, sessionCookieOptions());

    const next = typeof req.query.next === "string" ? req.query.next : "/";
    const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    res.redirect(302, `${publicOrigin(req)}${safe}`);
  });
}
