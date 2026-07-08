# Moataz AI Gateway — Railway Deployment

## Required Railway services

1. Create a **PostgreSQL** service in Railway.
2. Open your application service → **Variables**.
3. Add:

```env
DATABASE_URL=${{ Postgres.DATABASE_URL }}
ENCRYPTION_KEY=change-this-to-a-long-random-secret
JWT_SECRET=change-this-too
NEXT_PUBLIC_API_URL=
```

Leave `NEXT_PUBLIC_API_URL` empty. The frontend talks to the built-in `/api/*` routes on the same domain.

## Build command

```bash
npm install && npm run build
```

## Start command

```bash
npm run railway:start
```

On startup the app automatically runs:

```bash
prisma generate
prisma db push --accept-data-loss
node prisma/seed.js
```

This creates the database tables and inserts default providers, models, roles, permissions, a demo gateway API key, health rows, and sample usage data.

## Where to add provider keys

Open the deployed site → **Providers** → **Add Provider**. Enter:

- Provider name
- Base URL, for example `https://api.openai.com/v1` or `https://openrouter.ai/api/v1`
- Provider API key
- Default model

Then go to **Playground** and send a test message.
