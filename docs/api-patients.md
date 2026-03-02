# API / Backend — Pacientes (C.I.J.)

## Multi-tenant (obrigatório)

A tabela `patients` é **multi-tenant**. Todas as queries devem filtrar por `userId` do usuário autenticado.

- **Listar:** `SELECT ... FROM patients WHERE userId = ? ORDER BY id ...`
- **Criar:** `INSERT INTO patients (userId, ...) VALUES (?, ...)` com `userId` da sessão.
- **Atualizar / Excluir:** sempre incluir `userId = ?` na condição. Nunca rodar `UPDATE`/`DELETE` sem filtrar por usuário, para não afetar dados de outros tenants.

Exemplo de DELETE seguro (só remove dados do usuário 1):

```sql
DELETE FROM patients
WHERE userId = 1
  AND (phone LIKE '(1%' OR name LIKE '%Teste%' OR name LIKE '%Paciente Teste%');
```

Em código: usar `WHERE userId = ? AND id = ?` (e o primeiro parâmetro = `ctx.user.id`).

Exemplo em tRPC (Node):

```ts
// Listar pacientes do usuário logado
const list = await db.query(
  'SELECT id, name, phone, surgeryDate, surgeryType FROM patients WHERE userId = ? ORDER BY id LIMIT 25',
  [ctx.user.id]
);
```

## Formato dos dados

| Campo         | Tipo (API)   | Observação |
|---------------|--------------|------------|
| `id`          | string       | Numérico (ex: `"180001"`). Usar como string em rotas `/pacientes/:id`. |
| `name`        | string       | |
| `phone`       | string       | Formatos variados (com/sem máscara). Normalizar no front se quiser máscara. |
| `surgeryDate` | string \| null | `"YYYY-MM-DD HH:mm:00"` ou `null`. |
| `surgeryType` | string       | Pode ser `""`. |

## Referências no projeto

- Amostra de query e regras: `scripts/patients-query-sample.json`
- Seed para testes: `scripts/seed-patients.sql`
