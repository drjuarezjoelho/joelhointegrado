/**
 * API mínima — esboço.
 * Próximo passo: Express/Fastify + rotas auth/participants/visits/export.
 */
import "dotenv/config";

console.log(`
Linha Zero Study — server stub
  DATABASE_URL: ${process.env.DATABASE_URL ?? "(default sqlite)"}
  Coautores:    configure COAUTHORS_JSON (7) + npm run db:seed
  Docs:         docs/AUTH.md, docs/ARCHITECTURE.md
`);
