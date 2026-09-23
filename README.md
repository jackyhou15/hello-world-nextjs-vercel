# Next.js + Supabase list

This app fetches records from the `favorite_things` table in Supabase and renders them as a responsive card list.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

The values stay in local and deployment environment variables and are never committed.

## Development

```bash
npm install
npm run dev
```
