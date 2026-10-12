# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying outside Lovable (Vercel)

The app is a TanStack Start (Nitro) project and builds for Vercel with no code
changes. Vercel sets `VERCEL=1` during its builds, which makes `vite.config.ts`
emit the Vercel output format (`.vercel/output`); every other build (Lovable,
local) keeps the Cloudflare default.

1. Import the GitHub repository in Vercel. Leave the build command as
   `npm run build` (or `bun run build`) — no output directory is needed.
2. Add these environment variables (Project → Settings → Environment
   Variables) **before the first build** — the `VITE_*` values are baked into
   the bundle:

   | Variable                        | Value                                |
   | ------------------------------- | ------------------------------------ |
   | `VITE_SUPABASE_URL`             | Supabase project URL                 |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key      |
   | `SUPABASE_URL`                  | same URL (server-side)               |
   | `SUPABASE_PUBLISHABLE_KEY`      | same key (server-side)               |
   | `VITE_EMAILJS_*`                | optional, order notification e-mails |

   The values are the ones already in your local `.env`. See `.env.example`.

3. In Supabase (Authentication → URL configuration) add your Vercel domain to
   the Site URL / Redirect URLs, otherwise sign-in and account-creation e-mail
   links will point to the wrong place.
4. Deploy. Every push to `main` redeploys.

The database stays on the existing Supabase project; nothing needs migrating.
To try the Vercel build locally: `VERCEL=1 npm run build`.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
