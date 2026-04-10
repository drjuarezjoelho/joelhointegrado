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

### Paciente vs equipe (login)

- **Pacientes / acompanhantes:** rotas públicas (`/questionarios`, `/tcle`, etc.) sem OAuth.
- **Equipe clínica:** o botão “Entrar com conta” só aparece se existirem `VITE_OAUTH_PORTAL_URL` e `VITE_APP_ID` no build. Sem isso, o ecrã explica a configuração em vez de um botão que recarrega `/`.
- **API em produção:** o deploy estático na Vercel não inclui o Express; é preciso expor `/api/trpc` (serverless, outro serviço ou proxy) para a equipa obter sessão via `auth.me`.

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
