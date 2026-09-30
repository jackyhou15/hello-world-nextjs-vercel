# Next.js + Supabase list and authentication

This app fetches records from the `favorite_things` table, supports Google sign-in through Supabase Auth, and gives signed-in users a profile and a protected private studio.

Profile photos are stored in the private `avatars` Storage bucket. The `profiles` table stores only the object path, never binary image data.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

The values stay in local and deployment environment variables and are never committed.

## Supabase setup

Run [`supabase/week3_auth.sql`](supabase/week3_auth.sql) in the Supabase SQL editor. It creates:

- the `profiles` table with nullable `first_name` and `last_name` fields;
- an `auth.users` trigger that creates a profile for each new user;
- the private `avatars` Storage bucket and owner-only policies.

Enable Google in Supabase Auth using your Google OAuth client. The app redirect URL is exactly `/auth/callback`.

## Development

```bash
npm install
npm run dev
```
