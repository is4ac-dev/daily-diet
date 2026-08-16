# Daily Diet API

API REST para cadastro de usuários e gerenciamento de refeições, desenvolvida com Fastify, TypeScript, Knex e SQLite.

## Requisitos

- Node.js
- npm

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=
DATABASE_URL=
PORT=
```

Instale as dependências e execute as migrations:

```bash
npm install
npm run knex -- migrate:latest
```

Inicie a aplicação:

```bash
npm run dev
```

## Autenticação

Crie um usuário por meio de `POST /user`:

```json
{
  "name": "",
  "email": "",
  "password": ""
}
```

Autentique-se por meio de `POST /auth`:

```json
{
  "email": "",
  "password": ""
}
```

A resposta contém um token. Envie-o nas rotas protegidas:

```http
Authorization: Bearer <token>
```

## Rotas

### Usuário

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| `POST` | `/user` | Cria um usuário | Não |
| `POST` | `/auth` | Autentica um usuário | Não |
| `GET` | `/user` | Retorna o usuário autenticado | Sim |

### Refeições

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/meal` | Registra uma refeição |
| `GET` | `/meal` | Lista as refeições do usuário |
| `GET` | `/meal?id=<uuid>` | Retorna uma refeição |
| `PATCH` | `/meal/:id` | Atualiza uma refeição |
| `DELETE` | `/meal/:id` | Exclui uma refeição |
| `GET` | `/meal/metrics` | Retorna as métricas do usuário |

Todas as rotas de refeições exigem autenticação e acessam somente os registros pertencentes ao usuário autenticado.

### Registrar uma refeição

O campo `eatenAt` deve ser uma data no formato ISO 8601.

```json
{
  "name": "Almoço",
  "description": "Arroz, feijão e frango",
  "healthy": true,
  "eatenAt": "2026-08-16T15:30:00.000Z"
}
```

### Atualizar uma refeição

Envie ao menos um campo. Todos os campos são opcionais individualmente:

```json
{
  "name": "Almoço atualizado",
  "description": "Arroz, feijão, salada e frango",
  "healthy": true,
  "eatenAt": "2026-08-16T16:00:00.000Z"
}
```

O campo `updated_at` é atualizado automaticamente quando a rota `PATCH` é executada.

### Métricas

`GET /meal/metrics` retorna:

```json
{
  "totalMeals": 4,
  "healthyMeals": 3,
  "unhealthyMeals": 1,
  "bestHealthySequence": 2
}
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento |
| `npm run knex -- migrate:latest` | Executa as migrations pendentes |
| `npm run knex -- migrate:rollback` | Reverte o último lote de migrations |
| `npx tsc --noEmit` | Verifica os tipos TypeScript |
