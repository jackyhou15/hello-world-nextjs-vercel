# Sidewalk Takes

Sidewalk Takes is an AI caption generator and rating feed designed for a chronically online college student exploring New York City. Signed-in users describe a city moment, Gemini creates a caption, and the community can upvote or downvote it.

Profile photos are stored in the private `avatars` Storage bucket. The `profiles` table stores only the object path, never binary image data.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

The values stay in local and deployment environment variables and are never committed.

## Supabase setup

Run [`supabase/week3_auth.sql`](supabase/week3_auth.sql) in the Supabase SQL editor. It creates:

- the `profiles` table with nullable `first_name` and `last_name` fields;
- an `auth.users` trigger that creates a profile for each new user;
- the private `avatars` Storage bucket and owner-only policies.

Enable Google in Supabase Auth using your Google OAuth client. The app redirect URL is exactly `/auth/callback`.

Run [`supabase/week4_rating_app.sql`](supabase/week4_rating_app.sql) for the Week 4 tables and policies. It creates:

- `generations`, which saves the scene, exact AI prompt, caption, model, and owner;
- `votes`, with one vote per user per generation;
- strict RLS policies for public media, authenticated creation, and owner-only vote mutations;
- a read-only aggregate function that exposes totals without exposing other users' vote rows.

## Development

```bash
npm install
npm run dev
```
