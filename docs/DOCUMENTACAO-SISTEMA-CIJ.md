# Documentação do Sistema de Cadastro de Cirurgias C.I.J.

**Versão:** 1.0 (adaptada ao projeto atual)  
**Stack real:** React + Vite, Express + tRPC, SQLite

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Banco de Dados (Schema)](#4-banco-de-dados-schema)
5. [Backend (Servidor)](#5-backend-servidor)
6. [Frontend (Cliente)](#6-frontend-cliente)
7. [Fluxo de Dados](#7-fluxo-de-dados)
8. [Guia de Referência Rápida](#8-guia-de-referência-rápida)

---

## 1. Visão Geral do Projeto

O **Sistema de Cadastro de Cirurgias C.I.J.** é uma aplicação web para gerenciar pacientes de cirurgia de joelho, com acompanhamento pré e pós-operatório através de questionários padronizados (KOOS, IKDC, EVA). O projeto usa **SQLite** como banco de dados, **Express + tRPC** no backend e **React + Vite** no frontend.

### Principais Funcionalidades

- Cadastro de pacientes (nome, telefone, email, idade, sexo, data/tipo de cirurgia)
- Questionários: KOOS (42 itens), IKDC (18 itens), EVA (escala 0–10)
- Marcos temporais: baseline, 30, 60 e 90 dias
- TCLE (termo de consentimento) público e histórico de consentimentos (LGPD)
- Lembretes automáticos (7 dias e 1 dia antes da cirurgia)
- Exportação de dados (CSV), analytics e comparação de períodos

### Tecnologias Utilizadas

| Camada        | Tecnologia              | Propósito                    |
|---------------|-------------------------|-----------------------------|
| Frontend      | React 19 + TypeScript    | Interface do usuário        |
| Bundler       | Vite                    | Build e dev server          |
| Estilização   | Tailwind CSS 4          | Design responsivo           |
| Componentes   | shadcn/ui (Radix)       | UI acessível                |
| Roteamento    | wouter                  | Rotas no cliente            |
| Backend       | Express 4 + tRPC 11     | API tipada                  |
| Banco de dados| SQLite (better-sqlite3) | Persistência local          |
| Autenticação  | Cookie/sessão (stub)    | ctx.userId no tRPC          |
| Notificações  | Stub (Twilio/Email)     | Preparado para integração   |

---

## 2. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  Tailwind   │  │     shadcn/ui           │  │
│  │   Pages     │  │    CSS 4    │  │    Components           │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              tRPC Client (src/lib/trpc.ts)                 ││
│  │         createTRPCReact<AppRouter>                          ││
│  └──────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTP (proxy /api → server)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVIDOR (Node.js)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Express + createExpressMiddleware (tRPC)       ││
│  │         POST /api/trpc/* → procedures                        ││
│  └──────────────────────────┬──────────────────────────────────┘│
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌───────────┐       ┌───────────┐                                │
│  │  auth     │       │ patients  │                                │
│  │  Router   │       │  Router   │                                │
│  └───────────┘       └─────┬─────┘                                │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              server/db/index.ts (getDb)                     ││
│  │         better-sqlite3 → data/cij.db                        ││
│  └──────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (SQLite)                       │
│  users | patients | timepoints | consents | questionnaire_       │
│        | reminders | ikdc_responses | koos_responses |          │
│        | pain_assessments                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Requisição

1. Usuário interage na página (ex.: Dashboard).
2. Componente chama `trpc.patients.list.useQuery()`.
3. Cliente tRPC envia POST para `/api/trpc/patients.list` (Vite faz proxy para o servidor).
4. Express repassa para o tRPC; a procedure `patients.list` roda.
5. Procedure usa `getDb()` e `db.prepare(...).all(ctx.userId)`.
6. Resposta volta pelo tRPC; React atualiza a UI.

---

## 3. Estrutura de Arquivos

### Diretório Raiz

```
cadastro-ci/
├── src/                    # Frontend (React)
├── server/                 # Backend (Express + tRPC)
├── scripts/                # Scripts (ex.: seed-sqlite)
├── docs/                   # Documentação
├── data/                   # SQLite DB (gerado em runtime)
├── package.json
├── vite.config.ts          # Alias @/, proxy /api
└── tsconfig.json
```

### Frontend (src/)

```
src/
├── pages/                  # Páginas
│   ├── Dashboard.tsx           # Lista de pacientes
│   ├── PatientForm.tsx         # Novo / editar paciente
│   ├── PatientDetail.tsx       # Detalhe + timepoints
│   ├── PatientScores.tsx       # Relatório de scores
│   ├── Questionnaires.tsx      # Questionários por timepoint (dashboard)
│   ├── PublicQuestionnaires.tsx # Lista pública (EVA/IKDC/KOOS)
│   ├── QuestionnaireEVA.tsx    # Formulário EVA público
│   ├── QuestionnaireIKDC.tsx   # Formulário IKDC público
│   ├── QuestionnaireKOOS.tsx   # Formulário KOOS público
│   ├── PublicTCLE.tsx          # TCLE + cadastro público
│   ├── Reminders.tsx           # Lembretes
│   ├── Analytics.tsx          # Analytics
│   ├── PeriodComparison.tsx   # Comparação de períodos
│   └── NotFound.tsx
├── routes/
│   └── consent-history.tsx     # Histórico de consentimentos
├── components/
│   ├── ui/                      # shadcn (button, card, input, etc.)
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   └── ...
│   ├── questionnaires/
│   │   ├── EvaForm.tsx
│   │   ├── IkdcForm.tsx
│   │   └── KoosForm.tsx
│   ├── ErrorBoundary.tsx
│   ├── ConsentForm.tsx
│   └── ExportData.tsx
├── lib/
│   ├── trpc.ts                  # createTRPCReact<AppRouter>
│   ├── utils.ts                 # cn()
│   └── questionnaire-data/     # Dados IKDC/KOOS (formulários)
├── hooks/
│   ├── useAuth.ts
│   └── useMobile.ts
├── contexts/
│   └── ThemeContext.tsx
├── const.ts                     # getLoginUrl, UNAUTHED_ERR_MSG
├── App.tsx
├── main.tsx
└── index.css                    # Tailwind + tema C.I.J.
```

### Backend (server/)

```
server/
├── db/
│   ├── index.ts                 # getDb(), initSchema(), migrateConsents()
│   └── schema.sql               # CREATE TABLE (users, patients, ...)
├── routers/
│   ├── index.ts                 # appRouter (auth + patients)
│   ├── auth.ts                  # me, logout
│   └── patients.ts              # list, getById, getTimepoints, create, update,
│                                 # getTimepoint, getAllConsents, revokeConsent,
│                                 # publicRegister, publicSaveEva, publicSaveIkdc,
│                                 # publicSaveKoos, saveEvaToTimepoint, etc.
├── trpc.ts                      # createContext, publicProcedure, protectedProcedure
└── index.ts                     # Express, CORS, /api/trpc
```

---

## 4. Banco de Dados (Schema)

O banco é **SQLite**, arquivo em `data/cij.db`. O schema está em `server/db/schema.sql` e é aplicado na primeira chamada a `getDb()`.

### Tabelas Principais

| Tabela                   | Descrição |
|--------------------------|-----------|
| **users**                | Usuários (openId, role user/admin). Opcional; hoje auth é stub (userId=1). |
| **patients**             | Pacientes (userId, name, phone, email, age, gender, surgeryDate, surgeryType, notes). |
| **timepoints**           | Marcos temporais (patientId, timepointType: baseline \| 30days \| 60days \| 90days). |
| **consents**             | Consentimentos TCLE (patientId, consentType, consentText, isAccepted, isRevoked, …). |
| **questionnaire_responses** | Respostas genéricas (patientId, timepointId, questionnaireType, valueJson). |
| **ikdc_responses**       | Respostas IKDC normalizadas (timepointId, item1–item19). |
| **koos_responses**       | Respostas KOOS normalizadas (timepointId, pain1–9, symptoms1–7, adl1–17, sport1–5, qol1–4). |
| **pain_assessments**     | EVA por timepoint (timepointId, painScore). |
| **reminders**            | Lembretes (patientId, reminderType, scheduledFor, status, sentAt, failureReason). |

### Relacionamentos

- `patients.userId` → usuário (lógico; sem FK no SQLite atual).
- `timepoints.patientId` → `patients.id` (ON DELETE CASCADE).
- `consents.patientId` → `patients.id`.
- `questionnaire_responses`, `ikdc_responses`, `koos_responses`, `pain_assessments`: `timepointId` → `timepoints.id`.
- `reminders.patientId` → `patients.id`.

O app hoje grava questionários principalmente em **questionnaire_responses** (valueJson). As tabelas **ikdc_responses**, **koos_responses** e **pain_assessments** estão no schema para uso futuro ou migração.

---

## 5. Backend (Servidor)

### Entrada: server/index.ts

- Express, CORS, `createExpressMiddleware` do tRPC em `/api/trpc`.
- Contexto tRPC: `getDb()` e `userId` (fixo 1 no stub).

### Contexto e Procedures: server/trpc.ts

- `createContext`: retorna `{ db, userId }`.
- `publicProcedure`: qualquer um (ex.: TCLE, cadastro público, salvar EVA/IKDC/KOOS).
- `protectedProcedure`: exige `ctx.userId` (middleware); usado para listar/editar pacientes, timepoints, consentimentos, lembretes.

### Router Principal: server/routers/index.ts

```typescript
export const appRouter = router({
  auth: authRouter,    // me, logout
  patients: patientsRouter,
});
export type AppRouter = typeof appRouter;
```

### Router de Pacientes (resumo)

- **Autenticados:** list, getById, getTimepoints, getTimepoint, create, update, createTimepoint, createConsent, updatePhone, getPatientScores, getAllConsents, revokeConsent, saveEvaToTimepoint, saveIkdcToTimepoint, saveKoosToTimepoint, getRemindersStatus, getAllReminders, createAllReminders, processReminders, cancelReminder, checkWhatsAppStatus, sendQuestionnaireInvite, sendSurgeryReminder (stubs).
- **Públicos:** publicRegister (TCLE + cadastro), publicSaveEva, publicSaveIkdc, publicSaveKoos.

Acesso ao banco: `const db = getDb();` e depois `db.prepare("SELECT ...").all(...)` ou `.run(...)`.

---

## 6. Frontend (Cliente)

### Rotas (App.tsx)

| Rota | Componente |
|------|------------|
| `/` | Dashboard |
| `/pacientes/novo` | PatientForm |
| `/pacientes/:id/editar` | PatientForm |
| `/pacientes/:id` | PatientDetail |
| `/pacientes/:id/scores` | PatientScores |
| `/questionarios/:id` | Questionnaires (por timepoint) |
| `/questionarios` | PublicQuestionnaires |
| `/questionario/eva` | QuestionnaireEVA |
| `/questionario/ikdc` | QuestionnaireIKDC |
| `/questionario/koos` | QuestionnaireKOOS |
| `/tcle` | PublicTCLE |
| `/consent-history/:patientId` | ConsentHistory |
| `/lembretes` | Reminders |
| `/analytics` | Analytics |
| `/period-comparison` | PeriodComparison |

### Cliente tRPC (src/lib/trpc.ts)

- `createTRPCReact<AppRouter>()` com React Query (QueryClientProvider no main.tsx).
- Uso: `trpc.patients.list.useQuery()`, `trpc.patients.create.useMutation()`.

### Constantes e login (src/const.ts)

- `getLoginUrl()`: URL de login (OAuth se VITE_OAUTH_PORTAL_URL e VITE_APP_ID; senão `"/"`).
- `UNAUTHED_ERR_MSG`: mensagem de 401; main.tsx redireciona para `getLoginUrl()` quando o erro é esse.

### Tema (src/index.css)

- Paleta C.I.J.: primary `#00b4a0`, background `#001a4d`, card `#003366`, etc.
- Variáveis CSS em `:root` e `.dark`; `@theme inline` para Tailwind 4.

---

## 7. Fluxo de Dados

### Cadastro de paciente (dashboard)

1. Usuário acessa `/pacientes/novo` e preenche PatientForm.
2. Submit chama `trpc.patients.create.useMutation().mutate(dados)`.
3. Backend valida com Zod e faz `INSERT INTO patients`.
4. onSuccess redireciona para `/consent-history/:id` ou lista.

### Cadastro público (TCLE + questionários)

1. Paciente acessa `/tcle` (opcional: `?p=base64(telefone)`).
2. Aceita o TCLE e preenche nome, telefone, etc.; submit chama `patients.publicRegister`.
3. Backend insere em `patients` e `consents`; retorna `patientId`.
4. Frontend redireciona para `/questionarios?patientId=...`.
5. Paciente escolhe EVA/IKDC/KOOS; cada um chama `publicSaveEva`, `publicSaveIkdc` ou `publicSaveKoos` com `patientId` e respostas; dados vão para `questionnaire_responses`.

### Questionários por timepoint (médico)

1. Em PatientDetail, médico clica em “Preencher” em um timepoint.
2. Navega para `/questionarios/:id` (id = timepointId).
3. Questionnaires carrega o timepoint com `getTimepoint` e exibe abas KOOS/IKDC/EVA.
4. EvaForm, IkdcForm, KoosForm chamam `saveEvaToTimepoint`, `saveIkdcToTimepoint`, `saveKoosToTimepoint` com `timepointId`; dados vão para `questionnaire_responses` (e opcionalmente para as tabelas normalizadas no futuro).

---

## 8. Guia de Referência Rápida

### Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe o Vite (frontend) em geral na porta 5173 |
| `npm run server` | Sobe o Express (backend) na porta 3000 |
| `npm run db:seed` | Popula o SQLite com dados de exemplo |
| `npm run build` | Compila o projeto (tsc + vite build) |

### Procedures tRPC

- **Query:** `protectedProcedure.input(z.object({...})).query(({ ctx, input }) => { ... })`
- **Mutation:** `.mutation(...)` no lugar de `.query(...)`.
- **Público:** use `publicProcedure` em vez de `protectedProcedure`.

### Padrão de componente com dados

```typescript
const { data, isLoading } = trpc.patients.list.useQuery();
const mutation = trpc.patients.create.useMutation({
  onSuccess: () => toast.success("Ok"),
  onError: (e) => toast.error(e.message),
});
```

---

## Conclusão

Esta documentação descreve o **projeto cadastro-ci** como está: React + Vite no frontend, Express + tRPC no backend, SQLite com schema em `server/db/schema.sql`, sem Drizzle. Para aprofundar, consulte na ordem: `server/db/schema.sql`, `server/routers/patients.ts`, `src/App.tsx` e `src/pages/Dashboard.tsx`.
