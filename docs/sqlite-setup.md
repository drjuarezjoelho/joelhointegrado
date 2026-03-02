# Backend com SQLite

O projeto pode usar **SQLite** local para desenvolvimento e testes. O banco fica em `data/cij.db`.

## Como rodar

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Criar o banco e popular (seed)**
   ```bash
   npm run db:seed
   ```
   Cria a pasta `data/`, o arquivo `data/cij.db` e insere alguns pacientes de exemplo.

3. **Subir o backend (API tRPC)**
   ```bash
   npm run server
   ```
   Servidor em `http://localhost:3000`, tRPC em `http://localhost:3000/api/trpc`.

4. **Subir o frontend (em outro terminal)**
   ```bash
   npm run dev
   ```
   Vite em `http://localhost:5173` com proxy de `/api` para o backend.

5. Acesse **http://localhost:5173**. O login é simulado (sempre usuário 1).

## Schema SQLite

- **patients** – id, userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes, createdAt, updatedAt
- **timepoints** – id, patientId, timepointType (baseline, 30days, 60days, 90days), assessmentDate, createdAt
- **consents** – id, patientId, consentType, consentText, isAccepted, createdAt

Todas as queries filtram por `userId` (multi-tenant). O contexto do servidor usa `userId = 1` por padrão.

## Variáveis de ambiente

- `SQLITE_DB_PATH` – caminho do arquivo SQLite (padrão: `data/cij.db`)
- `PORT` – porta do servidor (padrão: 3000)

## Produção

Para produção, você pode continuar usando TiDB/MySQL e apontar o backend para esse banco, ou usar SQLite em um volume persistente. As rotas tRPC são as mesmas; só troca a camada de dados no servidor.
