# Projeto Linha Zero — estudo (repositório paralelo)

Aplicação de **coleta de dados para publicação científica**, separada do `cadastro-ci` (operacional).  
Não compartilha banco nem usuários com o cadastro clínico.

## Estrutura de pastas (esboço)

```
linha-zero-study/
├── README.md                 ← você está aqui
├── package.json
├── .env.example
├── drizzle.config.ts
├── docs/
│   ├── ARCHITECTURE.md       ← decisões técnicas e fluxo CRF
│   ├── AUTH.md               ← login dos 7 coautores
│   └── DATA_DICTIONARY.md    ← variáveis e exportação
├── drizzle/
│   └── schema.ts             ← schema mínimo (Drizzle + SQLite/Postgres)
├── scripts/
│   └── seed-coauthors.ts     ← cria 7 contas a partir do .env
├── server/                   ← API (a implementar)
│   ├── index.ts
│   ├── auth/
│   │   ├── password.ts
│   │   └── session.ts
│   ├── db/
│   │   └── index.ts
│   └── routers/
│       ├── auth.ts
│       ├── participants.ts
│       ├── visits.ts
│       └── export.ts
└── web/                      ← front (migrar protótipo de cadastro-ci)
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── pages/
        │   ├── Login.tsx
        │   ├── Participants.tsx
        │   ├── ParticipantForm.tsx
        │   └── VisitForm.tsx
        ├── components/
        └── lib/
            ├── api.ts
            └── visit-payload.ts   ← tipos do JSON por visita
```

## Como extrair do monorepo atual

1. Copie `linha-zero-study/` para um repositório Git novo (`linha-zero-study`).
2. Migre UI de `cadastro-ci/src/components/linha-zero/` → `web/src/components/`.
3. Troque `localStorage` por chamadas à API (`participants` + `visits`).
4. Remova a rota `/linha-zero` do cadastro quando o app paralelo estiver em produção.

## Primeiros comandos (quando o app estiver ligado)

```bash
cp .env.example .env
# Edite COAUTHORS_JSON e LINHA_ZERO_SEED_PASSWORD
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Perfis dos 7 coautores

| Slot | Papel sugerido | `role` no banco |
|------|----------------|-----------------|
| 1 | Investigador responsável (PI) | `pi_admin` |
| 2–6 | Coautores / investigadores | `investigator` |
| 7 | Monitoração / estatística (somente leitura + export) | `data_monitor` |

Ajuste nomes e e-mails em `COAUTHORS_JSON` (ver `docs/AUTH.md`).

## Interface web + API

```bash
npm run dev          # API :3001 + Vite :5174
npm run build && npm run start   # produção (API serve dist/)
```

Abra http://localhost:5174 — login com coautor do seed (`docs/AUTH.md`).
