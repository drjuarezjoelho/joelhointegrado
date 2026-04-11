# Cadastro de Cirurgias C.I.J.

Sistema de cadastro e acompanhamento de pacientes de cirurgia de joelho do **Centro Integrado de Joelho (C.I.J.)**, funcionando como **apêndice** do site [drjuarezsebastian.com](http://drjuarezsebastian.com).

**URL prevista (após deploy e integração):** `http://drjuarezsebastian.com/cadastro-cirurgias` — essa rota ainda não está publicada; o app roda localmente ou onde você fizer o deploy. Quando o subpath for configurado no servidor do domínio principal, o cadastro ficará acessível nesse endereço.

---

## O que é

Aplicação web para:

- **Cadastro de pacientes** (dados pessoais, data e tipo de cirurgia)
- **Questionários padronizados** KOOS, IKDC e EVA (pré e pós-operatório)
- **Marcos temporais** (baseline, 30, 60 e 90 dias)
- **TCLE** (termo de consentimento) e histórico (LGPD)
- **Lembretes** automáticos e **exportação de dados** (CSV, analytics)

---

## Tecnologias

| Camada       | Stack                    |
|-------------|--------------------------|
| Frontend    | React 18 + TypeScript, Vite, Tailwind CSS 4, shadcn/ui, wouter |
| Backend     | Express 4 + tRPC 11       |
| Banco       | SQLite (Drizzle ORM)     |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm

### Passos

```bash
# Clonar o repositório
git clone https://github.com/drjuarezjoelho/joelhointegrado.git
cd joelhointegrado

# Instalar dependências
npm install

# Subir o banco (SQLite) – opcional, cria pasta data/ e tabelas
npm run db:push

# Subir frontend + backend juntos (recomendado)
npm run dev:all

# (Opcional) subir separado em 2 terminais:
# npm run server
# npm run dev
```

Acesse **http://localhost:5173**. O front consome a API em `/api/trpc` (proxy configurado no Vite).

### Scripts úteis

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Frontend em modo desenvolvimento |
| `npm run dev:all` | Frontend + API local em um comando |
| `npm run server` | Backend Express + tRPC |
| `npm run build` | Build de produção (front) |
| `npm run db:push` | Aplica schema no SQLite |
| `npm run db:studio` | Drizzle Studio (visualizar banco) |
| `npm run db:seed` | Popula banco com dados de exemplo |

### Integração Braintrust (Vercel)

Se você instalou o Braintrust via Vercel Integrations, configure no ambiente do projeto:

- `BRAINTRUST_API_KEY` (obrigatória para enviar traces/logs)
- `BRAINTRUST_PROJECT_ID` (recomendada)
- `BRAINTRUST_PROJECT_NAME` (opcional, padrão: `cadastro-ci`)

No backend (`server/trpc.ts`) as procedures tRPC já estão instrumentadas.  
Sem `BRAINTRUST_API_KEY`, a aplicação continua funcionando normalmente (observabilidade desativada).

### Login da equipe (Google OAuth)

Fluxo único: **Google OAuth 2.0** → callback em `/api/oauth/google/callback` → cookie de sessão (`cij_session`) → `auth.me` no tRPC.

**Variáveis (ver também `.env.example`):**

| Onde | Variável | Descrição |
|------|-----------|-----------|
| Frontend (build) | `VITE_GOOGLE_CLIENT_ID` | Client ID OAuth (Web); pode repetir o mesmo valor no servidor. |
| Servidor | `GOOGLE_CLIENT_ID` | Igual ao Client ID. |
| Servidor | `GOOGLE_CLIENT_SECRET` | **Secreto** — só no backend. |
| Servidor | `SESSION_SECRET` | ≥32 caracteres em produção (assinatura JWT do cookie). |
| Frontend (opcional) | `VITE_API_URL` | Se o React estiver noutro domínio que a API, URL base da API (ex. `https://api.exemplo.com`). |

**Google Cloud Console** ([APIs e serviços → Credenciais](https://console.cloud.google.com/apis/credentials)):

1. Criar **ID do cliente OAuth** → tipo **Aplicação Web**.
2. **URIs de redirecionamento autorizados:** incluir  
   `http://localhost:5173/api/oauth/google/callback` (dev com Vite),  
   `http://localhost:3000/api/oauth/google/callback` (API direta),  
   e o URL de produção, ex. `https://seu-dominio.vercel.app/api/oauth/google/callback` ou o domínio onde o **browser** vê a API.
3. **Origens JavaScript autorizadas:** `http://localhost:5173`, origem de produção.

**Pacientes / visitantes:** continuam a usar rotas públicas (`/questionarios`, `/tcle`, …) sem login.

**Produção com um só processo Node:** após `npm run build`, `NODE_ENV=production` e `SERVE_STATIC` (predefinição: ativo) fazem o Express servir `dist/` e a API no mesmo host — adequado a **Railway**, **Render**, VM, etc.  
**Vercel só com front estático:** o bundle não corre o Express nem SQLite nativo; use `VITE_API_URL` para apontar para uma API alojada noutro sítio ou mude o modelo de deploy.

---

## Documentação

- [Documentação do sistema (C.I.J.)](docs/DOCUMENTACAO-SISTEMA-CIJ.md) – arquitetura, fluxos, referência
- [API Pacientes](docs/api-patients.md) – regras de acesso e multi-tenant
- [Configuração SQLite](docs/sqlite-setup.md) – banco local
- [Importação por planilha XLS/XLSX](docs/importacao-planilha-xls.md) – cirurgias marcadas em lote
- [Como subir no GitHub](docs/COMO-SUBIR-GITHUB.md) – push e atualizações
- [Roadmap e integração](docs/roadmap-e-integracao.md) – integração com o site principal

---

## Integração com drjuarezsebastian.com

Este projeto é pensado para ser usado como **módulo/apêndice** do site **[drjuarezsebastian.com](http://drjuarezsebastian.com)**:

- **Site principal:** consultas, informações e presença online — [drjuarezsebastian.com](http://drjuarezsebastian.com).
- **Cadastro de Cirurgias:** este repositório; após deploy e configuração no servidor, ficará em um subpath (ex.: `/cadastro-cirurgias`). *Se esse link retornar 404, é porque a integração ainda não foi feita.*

Assim, o usuário permanece no mesmo domínio: navega no site do Dr. Juarez e acessa o cadastro de cirurgias sem sair do endereço. A integração técnica (proxy, login único, subpath) está descrita em [docs/roadmap-e-integracao.md](docs/roadmap-e-integracao.md).

---

## Repositório

- **GitHub:** [github.com/drjuarezjoelho/joelhointegrado](https://github.com/drjuarezjoelho/joelhointegrado)

---

## Licença

Projeto privado – Centro Integrado de Joelho (C.I.J.).
