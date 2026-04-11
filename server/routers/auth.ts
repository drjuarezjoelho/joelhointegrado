import { router, publicProcedure } from "../trpc";
import { sessionCookieName } from "../auth/jwt-session";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.userId || !ctx.user) return null;
    return {
      id: ctx.user.id,
      name: ctx.user.name ?? "Utilizador",
      email: ctx.user.email ?? null,
      role: ctx.user.role,
    };
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(sessionCookieName, { path: "/" });
    return { ok: true as const };
  }),
});
