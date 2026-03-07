import { router } from "../trpc";
import { authRouter } from "./auth";
import { patientsRouter } from "./patients";
import { registrationRouter } from "./registration";

export const appRouter = router({
  auth: authRouter,
  patients: patientsRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
