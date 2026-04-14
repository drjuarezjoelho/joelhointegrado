# Publicar em `www.drjuarezsebastian.com` (Railway + HostGator)

Este guia liga o domínio na **HostGator** ao serviço na **Railway**. O código já está preparado (Docker + OAuth na mesma origem).

> **Nota Railway (planos):** no plano **Trial**, costuma haver **1 domínio customizado por serviço**. Usar só **`www.drjuarezsebastian.com`** encaixa nisso. Apex (`drjuarezsebastian.com` sem `www`) exige segundo domínio ou redirect noutro sítio — ver secção 6.

---

## 1. Railway — domínio customizado

1. Aceda a [railway.app](https://railway.app) → projeto → serviço **joelhointegrado** (ou o nome do serviço web).
2. **Settings** → **Networking** → **Public networking** → **+ Custom Domain**.
3. Escreva exatamente: `www.drjuarezsebastian.com` (sem `https://`, sem barra no fim).
4. A Railway mostra um **valor CNAME** (ex.: `xxxxxxxx.up.railway.app`). **Copie esse valor** — vai para o DNS na HostGator.
5. Aguarde até aparecer **visto verde** / domínio verificado (pode levar de minutos a horas; DNS até ~72 h em casos raros).

**SSL:** após verificação, a Railway emite certificado **HTTPS** automaticamente.

---

## 2. HostGator — registo DNS (CNAME)

1. Inicie sessão na **HostGator** → **cPanel** (ou portal atual da HostGator).
2. Abra **Zone Editor** / **Editor de Zona DNS** / **DNS avançado** (o nome varia).
3. **Adicionar registo** do tipo **CNAME**:
   - **Nome / Host:** `www`  
     (em alguns painéis: `www.drjuarezsebastian.com` — o importante é que o subdomínio público seja `www`.)
   - **Aponta para / Destino / Target:** o valor que a Railway deu (ex.: `xxxxxxxx.up.railway.app`) — **sem** `https://`.
   - **TTL:** automático ou 14400.
4. Guarde o registo.

**Verificação no Windows (PowerShell ou CMD):**

```text
nslookup www.drjuarezsebastian.com
```

O resultado deve mostrar um alias para o host `*.up.railway.app` (ou o target que a Railway indicou).

---

## 3. Railway — variáveis (produção)

No mesmo serviço → **Variables**:

| Variável | Onde | Valor |
|----------|------|--------|
| `GOOGLE_CLIENT_ID` | Runtime | Client ID OAuth (Web). |
| `GOOGLE_CLIENT_SECRET` | Runtime | Segredo do cliente. |
| `SESSION_SECRET` | Runtime | ≥32 caracteres aleatórios. |
| `VITE_GOOGLE_CLIENT_ID` | **Build** | **Igual** ao `GOOGLE_CLIENT_ID`. |

Depois de alterar `VITE_*`, faça **Redeploy** para o bundle do Vite incluir o ID.

**SQLite persistente (recomendado):** volume montado em `/app/data` e `SQLITE_DB_PATH=/app/data/cij.db` (ver [RAILWAY.md](./RAILWAY.md)).

---

## 4. Google Cloud — OAuth (obrigatório para o domínio novo)

[Console → Credenciais OAuth](https://console.cloud.google.com/apis/credentials) → cliente **Web** usado pela app.

**Origens JavaScript autorizadas** — adicione (mantenha as de desenvolvimento se quiser):

```text
https://www.drjuarezsebastian.com
```

**URIs de redirecionamento autorizados** — adicione **exatamente** (sem barra no fim):

```text
https://www.drjuarezsebastian.com/api/oauth/google/callback
```

Guarde. Erros `redirect_uri_mismatch` são quase sempre **caracter a caracter** diferentes.

---

## 5. Confirmar que está no ar

1. `https://www.drjuarezsebastian.com/api/health` → JSON com `"ok": true`.
2. `https://www.drjuarezsebastian.com/` → ecrã C.I.J. → **Equipe clínica** → **Entrar com conta** → login Google → dashboard.

---

## 6. Apex `drjuarezsebastian.com` (sem `www`)

- **Railway Trial (1 domínio):** use só `www` como domínio customizado; na HostGator configure **redireccionamento de URL** (Forwarding) de `https://drjuarezsebastian.com` → `https://www.drjuarezsebastian.com`, **se** a HostGator oferecer HTTPS no redirect (varia por plano).
- **Alternativa:** subir de plano na Railway e adicionar o segundo domínio (apex), ou usar DNS com **CNAME flattening** no apex (nem todos os painéis HostGator suportam; às vezes é preciso **Cloudflare** na frente só para DNS).

Para já, o caminho mais simples é: **site oficial = `https://www.drjuarezsebastian.com`**.

---

## 7. Problemas frequentes

| Sintoma | O que fazer |
|---------|-------------|
| Domínio na Railway “pending” | Confirme o CNAME na HostGator; espere propagação; `nslookup www.drjuarezsebastian.com`. |
| `redirect_uri_mismatch` | Confira redirect e origem no Google **com `www` e `https`**. |
| 502 na Railway | Logs do deploy; `PORT` é injectado pela Railway — não sobrescrever com valor errado. |
| Sem botão “Entrar” | `VITE_GOOGLE_CLIENT_ID` no **build** + Redeploy. |

---

## Resumo do que **você** tem de fazer (não automatizável daqui)

1. Railway → **+ Custom Domain** → `www.drjuarezsebastian.com` → copiar CNAME.
2. HostGator → **CNAME** `www` → esse alvo.
3. Google Cloud → origem + redirect **HTTPS** com `www`.
4. Railway → variáveis + **Redeploy** após `VITE_*`.
5. Testar os dois URLs do passo 5 acima.

Quando o DNS propagar, o site fica visível em **`https://www.drjuarezsebastian.com`**.
