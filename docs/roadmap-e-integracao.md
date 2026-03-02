# Deixar tudo funcionando + Integrar com outro site

## 1. O que já temos no projeto

- **Front:** `App.tsx`, `main.tsx`, `index.css`, `index.html`, hook `useAuth`
- **Rotas (wouter):** Dashboard, pacientes (novo/detalhe/scores), questionários (EVA, IKDC, KOOS), TCLE, analytics, lembretes
- **Estilo:** Tailwind v4 + paleta C.I.J. (azul #001a4d, teal #00b4a0)
- **Backend (conhecido):** TiDB Cloud, tabela `patients` multi-tenant; ver `docs/api-patients.md`

## 2. O que falta para o site funcionar de ponta a ponta

### 2.1 Arquivos que ainda precisam ser colados ou criados

| Arquivo | Função |
|--------|--------|
| `src/const.ts` | `getLoginUrl()` e outras constantes (URL do login, API base) |
| `src/lib/trpc.ts` | Cliente tRPC (tipo do `trpc` usado em `main.tsx` e `useAuth`) |
| `shared/const.ts` ou `src/../shared/const.ts` | `UNAUTHED_ERR_MSG` (mensagem de “não autenticado”) |
| `package.json` | Dependências (React, Vite, wouter, tRPC, TanStack Query, Tailwind, shadcn, etc.) |
| `vite.config.ts` | Alias `@/` → `src/`, proxy `/api/trpc` se o backend rodar em outro host |
| `tsconfig.json` | Paths `@/*` e `@shared/*` |
| **Páginas** (ex.: `Dashboard`, `PatientForm`, `PatientDetail`) | Onde estão os botões que não funcionam; precisam chamar tRPC e usar as rotas |

### 2.2 Backend (API tRPC)

- O front chama `/api/trpc`. Ou o backend está no mesmo app (ex. Vite + Express) ou há um servidor separado que expõe tRPC.
- Rotas mínimas para “listar/criar/editar pacientes” e “auth (me, logout)” precisam existir e filtrar por `userId` (ver `api-patients.md`).
- Se o outro site que “funciona bem” já tem backend, pode ser o mesmo: mesma API, mesmo auth.

### 2.3 Ordem sugerida para colocar tudo no ar

1. **Criar `package.json` + `vite.config.ts` + `tsconfig.json`** para o projeto subir (`npm install`, `npm run dev`).
2. **Criar `src/const.ts` e `src/lib/trpc.ts`** (e onde estiver `@shared/const`, exportar `UNAUTHED_ERR_MSG`) para o `main.tsx` e o `useAuth` pararem de dar erro de import.
3. **Implementar ou conectar o backend tRPC** (auth.me, auth.logout, patients.list, patients.create, etc.) com filtro por `userId`.
4. **Colar/ajustar as páginas** (começando pelo **Dashboard** e **PatientForm**): botões que devem navegar usar `useLocation`/`Link` do wouter; ações que dependem de dados usar os hooks tRPC (ex. `trpc.patients.list.useQuery()`).
5. **Testar fluxo:** login → listar pacientes → novo paciente → editar/detalhe.

Assim que você colar os próximos arquivos (por exemplo `Dashboard`, `const`, `lib/trpc`, `package.json`), dá para ir corrigindo os botões e erros um a um.

---

## 3. Ideias para integrar este projeto a “outro site que funciona bem”

### 3.1 Mesmo domínio / mesmo backend

- **Mesmo backend e mesmo login:** o “outro site” e o cadastro C.I.J. usam a mesma API (tRPC) e o mesmo sistema de autenticação. Aqui você só adiciona rotas/páginas (ex. `/cadastro`, `/pacientes`) no app que já funciona, ou mantém dois SPAs no mesmo domínio (ex. `site.com` e `site.com/cadastro`).
- **Vantagem:** um login só, dados compartilhados, sem iframe.

### 3.2 Subpath no site principal

- Ex.: `clinica.com.br` = site que já funciona; `clinica.com.br/cadastro-ci` = este app (React).
- No servidor (Nginx, Vercel, etc.): servir o build do cadastro-ci em `/cadastro-ci` (ex. `rewrite /cadastro-ci* -> /cadastro-ci/index.html` para SPA).
- Links do site principal para “Cadastro de Cirurgias” apontam para `clinica.com.br/cadastro-ci`. O `getLoginUrl()` pode redirecionar para o login do site principal (ex. `clinica.com.br/login`) e voltar para `/cadastro-ci` após login.

### 3.3 Iframe no site principal

- Página no site que “funciona bem” com um `<iframe src="https://cadastroci-gle6et98.manus.space/...">`.
- **Prós:** isolamento, deploy separado. **Contras:** login pode precisar ser repassado (cookie/same-origin ou token no iframe); cuidado com bloqueios de iframe em alguns navegadores.

### 3.4 Single Sign-On (SSO) entre os dois

- Se o outro site já usa OAuth/SSO (ex. Google, ou provedor próprio), o cadastro C.I.J. usa o mesmo: após login no site principal, redireciona para o cadastro com um token (na URL ou em cookie) e o backend do cadastro valida esse token e associa à sessão tRPC. Assim um login só para os dois.

### 3.5 Menu / navegação compartilhada

- Se ambos forem React (ou um for e o outro tiver um header carregado via script): um componente “Header” ou “Menu” pode ser compartilhado (monorepo, pacote npm ou mesmo copiado) com link “Cadastro de Cirurgias” apontando para o cadastro. O usuário sente como um único site.

### 3.6 API única + dois front-ends

- Backend tRPC (ou REST) único; “site que funciona bem” e “cadastro C.I.J.” são dois front-ends que consomem a mesma API e o mesmo `userId` após login. O cadastro só expõe telas de pacientes/cirurgias/questionários; o outro site pode expor agendamento, contato, etc.

---

## 4. Próximos passos práticos

1. **Documentação:** regra de DELETE/UPDATE com `userId` já está em `docs/api-patients.md`.
2. **Você:** colar os arquivos que faltam (em especial `package.json`, `const.ts`, `lib/trpc.ts`, `Dashboard.tsx` ou a página onde os botões quebram). A partir daí dá para:
   - Ajustar imports e tipos.
   - Fazer os botões chamarem as rotas e a API.
   - Deixar listagem e formulário de pacientes funcionando.
3. **Integração:** dizer como o “outro site” está hoje (URL, se é React/HTML, se já tem login e onde roda o backend) para afinar uma das opções acima (subpath, iframe, mesmo backend, SSO).

Quando tiver o próximo arquivo (ou a lista do que existe no outro site), envie e seguimos a partir daí.
