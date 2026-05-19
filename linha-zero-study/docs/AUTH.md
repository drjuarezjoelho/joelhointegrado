# Autenticação — 7 coautores

## Modelo

- Login: **e-mail institucional** + **senha**.
- Senhas armazenadas com **bcrypt** (cost 12).
- Sessão: cookie `lz_session` (JWT, 30 dias, renovado a cada login).
- Secret: `LINHA_ZERO_SESSION_SECRET` (≥ 32 caracteres em produção).

## Papéis (`role`)

| Valor | Descrição |
|-------|-----------|
| `pi_admin` | PI: tudo + travar visitas + gerenciar usuários (1 pessoa) |
| `investigator` | Coautores: criar/editar participantes e visitas em rascunho |
| `data_monitor` | Conferência e export CSV; pode travar visitas |
| `readonly` | Somente leitura (revisor externo, se necessário) |

## Configuração dos 7 coautores

Edite `.env` a partir de `.env.example`:

```env
LINHA_ZERO_SEED_PASSWORD="SenhaTemporaria-Forte-2026!"
COAUTHORS_JSON='[
  {"email":"juarez@exemplo.edu.br","displayName":"Juarez Lima","role":"pi_admin"},
  {"email":"coautor1@exemplo.edu.br","displayName":"Coautor 1","role":"investigator"},
  {"email":"coautor2@exemplo.edu.br","displayName":"Coautor 2","role":"investigator"},
  {"email":"coautor3@exemplo.edu.br","displayName":"Coautor 3","role":"investigator"},
  {"email":"coautor4@exemplo.edu.br","displayName":"Coautor 4","role":"investigator"},
  {"email":"coautor5@exemplo.edu.br","displayName":"Coautor 5","role":"investigator"},
  {"email":"monitor@exemplo.edu.br","displayName":"Monitor / Estatística","role":"data_monitor"}
]'
```

Substitua e-mails e nomes reais antes do `npm run db:seed`.

## Primeiro acesso

1. PI executa `npm run db:seed` uma vez no servidor seguro.
2. Envia a cada coautor: URL do sistema + e-mail + **senha temporária** (`LINHA_ZERO_SEED_PASSWORD`) por canal privado (não e-mail em massa).
3. No primeiro login o sistema exige **nova senha** (`must_change_password`).
4. PI altera `LINHA_ZERO_SEED_PASSWORD` no `.env` após todos trocarem (a seed não recria usuários existentes).

## Boas práticas

- Senha mínima: 12 caracteres, letras + números.
- Não reutilizar senha do SysLife ou e-mail.
- Revogar acesso: `is_active = 0` no banco (não apagar linhas — auditoria).
- Em produção: considerar 2FA no futuro; para 7 usuários internos, senha forte + HTTPS costuma bastar na fase piloto.

## Rotacionar senha de um coautor (PI)

```sql
-- Apenas emergência; preferir endpoint change-password
UPDATE study_users SET must_change_password = 1 WHERE email = 'coautor@...';
```

Depois gere hash novo via script ou endpoint admin.
