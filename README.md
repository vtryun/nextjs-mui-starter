# nextjs-mui-starter

A Next.js App Router starter with MUI, Prisma, better-auth, Redux Toolkit, and TanStack Query.

## Tech Stack

| Layer        | Choice                                         |
| ------------ | ---------------------------------------------- |
| Framework    | Next.js 16 (App Router, React Compiler)        |
| UI           | MUI v9 + Emotion, Roboto via `next/font`       |
| Auth         | better-auth (email/password, Prisma adapter)   |
| Database     | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Client state | Redux Toolkit (snackbar)                       |
| Server state | TanStack Query                                 |
| Forms        | react-hook-form + Zod                          |
| Testing      | Vitest + Testing Library, Playwright           |

## Requirements

- Node.js 22+
- pnpm 11+
- PostgreSQL 15+

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then fill in the values:

   - `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — `http://localhost:3000` for local dev
   - `DATABASE_URL` — your PostgreSQL connection string

3. Apply database migrations:

   ```bash
   pnpm prisma migrate dev
   ```

4. (Optional) Seed the database:

   ```bash
   pnpm prisma db seed
   ```

   The seed script is a placeholder — see `prisma/seed.ts`. Add your own
   data once you introduce business models.

5. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `pnpm dev`           | Start the dev server     |
| `pnpm build`         | Production build         |
| `pnpm start`         | Run the production build |
| `pnpm lint`          | Run ESLint               |
| `pnpm test`          | Run Vitest in watch mode |
| `pnpm test:run`      | Run Vitest once          |
| `pnpm test:coverage` | Run Vitest with coverage |

## Project Structure

```
src/
├── app/
│   ├── (protected)/            # Routes requiring authentication
│   │   ├── layout.tsx          # Session check for all nested routes
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── api/auth/[...all]/      # better-auth handler
│   ├── sign-in/                # Email/password sign-in
│   ├── sign-up/                # Registration
│   ├── about/
│   ├── layout.tsx              # Root layout: providers
│   └── page.tsx
├── components/                 # Shared components
│   ├── query-provider.tsx      # TanStack Query provider
│   ├── snackbar-provider.tsx
│   ├── sign-out-button.tsx
│   ├── session-list.tsx
│   ├── theme-toggle.tsx
│   └── link.tsx
├── hooks/
│   └── useSnackbar.tsx
├── lib/
│   ├── auth.ts                 # better-auth server instance
│   ├── auth-client.ts          # better-auth client
│   ├── prisma.ts               # Prisma client singleton
│   └── theme.ts                # MUI theme
├── store/                      # Redux Toolkit store
│   ├── index.ts
│   ├── hooks.ts
│   └── snackbar-slice.ts
└── validations/
    └── auth.ts                 # Zod schemas


prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

## Architecture Notes

### Auth flow

- Server: `src/lib/auth.ts` exposes the better-auth instance, mounted at
  `/api/auth/[...all]`.
- Client: `src/lib/auth-client.ts` exports `authClient` plus `signIn`,
  `signUp`, `signOut`, and `useSession`.
- Route protection: `src/app/(protected)/layout.tsx` checks the session
  before rendering any nested route. If there is no session, it redirects
  to `/sign-in`.

There is no `middleware.ts` / `proxy.ts` in this project. App Router
layouts are the recommended place for auth checks, and running the check
in both a proxy and a layout would query the session twice per request.

### State management

Two separate concerns, two separate tools:

- **Redux Toolkit** — global UI state (currently only the snackbar).
- **TanStack Query** — server state cached on the client.

The `QueryProvider` wraps `StoreProvider` in the root layout. `QueryClient`
is created lazily per client mount, not at module scope, to avoid sharing
cache across SSR requests.

### Data fetching pattern

The `dashboard` page demonstrates the intended split:

- The page itself is a Server Component and reads the session via
  `auth.api.getSession`.
- The session list (`src/components/session-list.tsx`) is a Client
  Component that fetches data with `useQuery` and mutates with
  `useMutation`, invalidating the cache on success.

Use Server Components for first-paint data, TanStack Query for subsequent
client-side synchronization.

### Database

Prisma 7 with the driver adapter (`@prisma/adapter-pg`). Client output is
configured to `src/generated/prisma`, which is gitignored and regenerated
by `prisma generate` / `prisma migrate dev`.

## Adding a New Protected Route

Create the page under `src/app/(protected)/`:

```bash
mkdir -p src/app/\(protected\)/settings
touch src/app/\(protected\)/settings/page.tsx
```

The layout handles authentication automatically. No changes to a
middleware matcher are needed.

## Environment Variables

See `.env.example`. Never commit `.env`.
