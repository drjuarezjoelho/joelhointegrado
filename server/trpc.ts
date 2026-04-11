import type { Request, Response } from "express";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getDb } from "./db";
import { traceTrpcProcedure } from "./observability/braintrust";
import { verifySessionToken, sessionCookieName } from "./auth/jwt-session";
import { getUserById } from "./auth/upsert-google-user";

export const createContext = async (opts: {
  req: Request;
  res: Response;
}) => {
  const db = getDb();
  const token = opts.req.cookies?.[sessionCookieName] as string | undefined;
  const session = await verifySessionToken(token);

  let userId: number | null = null;
  let user: {
    id: number;
    name: string | null;
    email: string | null;
    role: string;
  } | null = null;

  if (session) {
    const row = getUserById(db, session.uid);
    if (row) {
      userId = row.id;
      user = row;
    }
  }

  return {
    db,
    userId,
    user,
    req: opts.req,
    res: opts.res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
const observabilityMiddleware = t.middleware(
  async ({ ctx, next, path, type }) =>
    traceTrpcProcedure({
      path,
      type,
      userId: ctx.userId ?? null,
      execute: () => next(),
    })
);

export const publicProcedure = t.procedure.use(observabilityMiddleware);

const requireUser = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(requireUser);
