# Deploy no Railway

O repositório inclui [`railway.toml`](../railway.toml) (build + `npm start` + health em `/api/health`).  
O [`Dockerfile`](../deploy/Dockerfile) **não** está na raiz de propósito: a Railway prioriza um `Dockerfile` na raiz e ignoraria esse fluxo; para Docker local use `docker build -f deploy/Dockerfile`.

## 1. Criar o serviço

1. Aceda a [railway.app](https://railway.app) e inicie sessão.
2. **New project** → **Deploy from GitHub repo** → escolha `drjuarezjoelho/joelhointegrado` (branch `main`).
3. A Railway deteta Node e aplica o `railway.toml`.

### Comando de build (se o deploy falhar com `EBUSY` em `node_modules/.vite`)

No log do deploy, o comando deve ser **`npm run build:deploy`** (apaga `node_modules` antes do `npm ci` e usa cache Vite em `.vite-cache`).

Se vir apenas **`npm ci && npm run build`**, o painel está a **sobrescrever** o repositório:

1. Serviço → **Settings** → **Build** (ou **Deploy** → **Build**).
2. **Apague** o “Custom Build Command” / deixe em branco **ou** escreva exatamente: `npm run build:deploy`.
3. Confirme que **Root Directory** está vazio (raiz do repo) — se apontar para uma pasta errada, o `railway.toml` não é lido.
4. **Redeploy**.

## 2. Variáveis de ambiente (obrigatórias)

No serviço → **Variables** (o mesmo valor pode repetir-se onde indicado):

| Nome | Onde usar | Descrição |
|------|-----------|-----------|
| `GOOGLE_CLIENT_ID` | Runtime | Client ID OAuth (Web) do Google Cloud. |
| `GOOGLE_CLIENT_SECRET` | Runtime | Segredo do cliente — **só servidor**. |
| `SESSION_SECRET` | Runtime | ≥32 caracteres aleatórios (ex.: `openssl rand -hex 32`). |
| `VITE_GOOGLE_CLIENT_ID` | **Build** | Igual ao `GOOGLE_CLIENT_ID` — o Vite injeta no bundle. |

**Como marcar variável só no build (Railway):** ao adicionar, escolha **“Build”** / **“Build-time”** para `VITE_GOOGLE_CLIENT_ID` se a UI o permitir; caso contrário, defina-a e faça **Redeploy** após alterações ao front.

Opcional:

| Nome | Descrição |
|------|-----------|
| `SQLITE_DB_PATH` | Caminho do ficheiro SQLite (ver volume abaixo). |
| `BRAINTRUST_*` | Se usar Braintrust no servidor. |

## 3. Domínio público

1. No serviço → **Settings** → **Networking** → **Generate domain** (ou ligue um domínio próprio).
2. Anote o URL HTTPS (ex.: `https://joelhointegrado-production.up.railway.app`).

## 4. Google Cloud — redirect URI

Em [Credenciais OAuth](https://console.cloud.google.com/apis/credentials) → o seu cliente **Web** → **URIs de redirecionamento autorizados**, adicione **exatamente**:

```text
https://<O_SEU_DOMINIO_RAILWAY>/api/oauth/google/callback
```

Substitua `<O_SEU_DOMINIO_RAILWAY>` pelo host do passo 3 (sem barra final).

**Origens JavaScript autorizadas:** o mesmo domínio `https://<host>`.

## 5. SQLite persistente (recomendado)

Sem volume, a base em `/app/data` pode perder-se entre deploys.

1. No projeto Railway → **New** → **Volume**.
2. Monte o volume no serviço Web, por exemplo em **`/app/data`**.
3. Variável: `SQLITE_DB_PATH=/app/data/cij.db`.
4. **Redeploy** o serviço.

## 6. Verificar

- `GET https://<host>/api/health` → JSON com `"ok": true`.
- Abrir `https://<host>/` → ecrã C.I.J. → **Entrar com conta** → fluxo Google → volta ao dashboard autenticado.

## 7. Problemas comuns

| Sintoma | Causa provável |
|---------|----------------|
| `EBUSY` / `rmdir ... node_modules/.vite` ou `.../.cache` | Ferramentas criam cache dentro de `node_modules`; o `npm ci` tenta apagar tudo e pode falhar. O script `build:deploy` corre `rm -rf node_modules` em Linux antes do `npm ci`. Atualize o `main`, faça **Redeploy**; se persistir, no serviço → **Settings** → **Clear build cache** (ou equivalente) e volte a fazer deploy. |
| Build sem `VITE_GOOGLE_CLIENT_ID` | Botão “Entrar” não aparece ou OAuth incompleto — definir no **build** e voltar a fazer deploy. |
| `redirect_uri_mismatch` | URI no Google Cloud não coincide **caracter a caracter** com o URL Railway. |
| 502 / health falha | `npm start` ou `PORT`; confira logs do deploy. |
| Sessão não grava | Cookies precisam do mesmo domínio; não misturar `www` e apex sem redirect. |
