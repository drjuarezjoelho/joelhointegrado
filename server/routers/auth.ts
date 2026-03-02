import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return {
      id: ctx.userId,
      name: "Usuário C.I.J.",
      email: "usuario@cij.local",
    };
  }),

  logout: publicProcedure.mutation(() => {
    return { ok: true };
  }),
});
