# Sidewalk Takes

Sidewalk Takes is an AI caption generator and rating feed designed for a chronically online college student exploring New York City. Signed-in users describe a city moment, Gemini creates a caption, and the community can upvote or downvote it.

Profile photos are stored in the private `avatars` Storage bucket. The `profiles` table stores only the object path, never binary image data.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://hello-world-nextjs-vercel.vercel.app
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


## Week 5: feedback and iteration

This iteration implements Prasie's feedback from October 7:

- **How does vibe influence the caption?** Each vibe now has a description and an instant example of the same delayed-train scene. The generation prompt contains a concrete tone direction, rather than just a style name. These examples are labeled illustrative; they are not presented as generated results.
- **Rename Private studio.** The protected `/studio` route is now **My collection**, with **Saved takes** (private to the owner) and **My creations** (your publicly shared generations).
- **Save/pin captions.** Authenticated users can save/unsave any caption. Rows persist in `saved_captions`, whose RLS policies permit only the owner to read, insert, or delete.
- **Create an image with captions.** The generator optionally creates an original SVG illustration with Gemini, including descriptive alt text. The existing Google key's raster-image model returned a free-tier quota of zero, so this app uses the working text model to draw SVG art. Images are labeled AI illustrations. They are sanitized to static drawing primitives and saved as files in Supabase Storage, never binary data in Postgres. Both generation prompts are preserved.

Additional usability improvements: responsive image cards, search, vibe filters, top-rated sorting, copy caption, reusable navigation, generation pending states, and inline vote/save errors. Existing captions, profiles, and votes are preserved.

Run `supabase/week5_feedback.sql` once against the same Supabase project before deploying. This adds the image metadata, private saved-captions table, and public AI-illustrations bucket with owner-only uploads/deletes. It does not broaden access to profiles, votes, or avatars.

### Demo flow

1. Visit the public board while logged out; captions and illustrations are readable, but voting/saving require login.
2. Sign in with Google. Open **Create**, choose a starter or describe a scene, switch vibes to compare examples, then generate a caption and illustration.
3. Upvote/downvote the new take; refresh to verify persistence. Clicking the selected vote removes it.
4. Save the take, visit **My collection → Saved takes**, and refresh. Open **My creations** to see your generated content.
5. Search/filter the board and inspect **Behind the take** to see both saved prompts.
6. Sign out. `/studio`, `/create`, and `/profile` redirect to the public board.

Keep Vercel deployment protection disabled and submit the URL of the Week 5 commit's deployment. Feedback-group presentation and course submission are performed by the student.


### Profile upload repair

Avatar files now upload directly from the browser to private Supabase Storage through an authenticated, object-specific signed upload URL. Selecting a photo stages the upload and shows a preview; Save profile applies it. Only the names and object path go through the Server Action, avoiding Next.js's 1 MB request limit and Vercel's 4.5 MB function-payload limit. The existing 5 MB bucket limit and owner-only RLS remain in force. Before saving a path, the server verifies its ownership, actual Storage size, and content type. Failed uploads and saves display inline errors without crashing the profile page.
