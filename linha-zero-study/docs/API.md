# API REST — Linha Zero Study

Base URL: `http://localhost:3001` (dev)

Todas as rotas autenticadas usam cookie `lz_session` (enviar `credentials: 'include'` no fetch).

## Auth

| Método | Rota | Body |
|--------|------|------|
| POST | `/api/auth/login` | `{ "email", "password" }` |
| POST | `/api/auth/logout` | — |
| GET | `/api/auth/me` | — |
| POST | `/api/auth/change-password` | `{ "currentPassword", "newPassword" }` (min 12) |

## Participantes

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/api/participants` | Lista |
| GET | `/api/participants/:id` | + visitas |
| POST | `/api/participants` | Cria + visita T0 vazia; gera `LZ-###` se omitido |
| PATCH | `/api/participants/:id` | investigator+ |

## Visitas

| Método | Rota |
|--------|------|
| GET | `/api/participants/:participantId/visits` |
| POST | `/api/participants/:participantId/visits` | `{ "timepoint": "T3", "payloadJson": {} }` |
| PATCH | `/api/visits/:id` | `{ "payloadJson", "collectionStatus": "complete" }` |
| POST | `/api/visits/:id/lock` | pi_admin, data_monitor |

## Exportação

| Método | Rota |
|--------|------|
| GET | `/api/export/csv` | wide (default) |
| GET | `/api/export/csv?format=long` | 1 linha por variável |

## Exemplo login (curl)

```bash
curl -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juarez@exemplo.edu.br","password":"SenhaTemporaria-Forte-2026!"}'

curl -b cookies.txt http://localhost:3001/api/participants
```
