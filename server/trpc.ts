import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getDb } from "./db";

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
export const publicProcedure = t.procedure;

const requireUser = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(requireUser);
