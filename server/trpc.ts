import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getDb } from "./db";
import { traceTrpcProcedure } from "./observability/braintrust";

export const createContext = async (opts: { req?: unknown; res?: unknown }) => {
  const db = getDb();
  const userId = 1;
  return { db, userId, ...opts };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
const observabilityMiddleware = t.middleware(async ({ ctx, next, path, type }) =>
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
