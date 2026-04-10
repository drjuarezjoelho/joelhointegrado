import { initLogger, traced } from "braintrust";

type ProcedureTraceArgs<T> = {
  path: string;
  type: string;
  userId?: number | null;
  execute: () => Promise<T>;
};

let initialized = false;
let disabledAfterInitFailure = false;

function getBraintrustProjectName() {
  return process.env.BRAINTRUST_PROJECT_NAME ?? "cadastro-ci";
}

function isBraintrustConfigured() {
  return Boolean(process.env.BRAINTRUST_API_KEY);
}

function ensureBraintrustLogger() {
  if (initialized || disabledAfterInitFailure) return initialized;
  if (!isBraintrustConfigured()) return false;

  try {
    initLogger({
      apiKey: process.env.BRAINTRUST_API_KEY,
      projectId: process.env.BRAINTRUST_PROJECT_ID,
      projectName: getBraintrustProjectName(),
      asyncFlush: true,
      setCurrent: true,
    });
    initialized = true;
    return true;
  } catch (error) {
    disabledAfterInitFailure = true;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[braintrust] initialization failed, tracing disabled: ${message}`);
    return false;
  }
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }
  return { message: String(error) };
}

export async function traceTrpcProcedure<T>({
  path,
  type,
  userId,
  execute,
}: ProcedureTraceArgs<T>) {
  if (!ensureBraintrustLogger()) return execute();

  const startedAt = Date.now();
  return traced(
    async (span) => {
      try {
        const result = await execute();
        span.log({
          metadata: {
            source: "trpc",
            path,
            procedureType: type,
            userId: userId ?? null,
            status: "ok",
            durationMs: Date.now() - startedAt,
          },
        });
        return result;
      } catch (error) {
        span.log({
          metadata: {
            source: "trpc",
            path,
            procedureType: type,
            userId: userId ?? null,
            status: "error",
            durationMs: Date.now() - startedAt,
            error: serializeError(error),
          },
        });
        throw error;
      }
    },
    {
      name: `trpc:${type}:${path}`,
    }
  );
}
