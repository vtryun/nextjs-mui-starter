# nextjs-mui-starter

A Next.js App Router starter with MUI, Prisma, better-auth, Redux Toolkit, and TanStack Query.

## Tech Stack

| Layer        | Choice                                                  |
| ------------ | ------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, React Compiler)                 |
| UI           | MUI v9 + Emotion, Roboto via `next/font`                |
| Auth         | better-auth (email/password + username, Prisma adapter) |
| Database     | PostgreSQL via Prisma 7 + `@prisma/adapter-pg`          |
| Client state | Redux Toolkit (snackbar)                                |
| Server state | TanStack Query                                          |
| Forms        | react-hook-form + Zod                                   |
| Testing      | Vitest + Testing Library                                |

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

   The Prisma client is generated into `src/generated/prisma`, which is
   gitignored. Run `pnpm prisma generate` after a fresh clone.

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

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Start the dev server              |
| `pnpm build`         | Production build                  |
| `pnpm start`         | Run the production build          |
| `pnpm lint`          | Run ESLint                        |
| `pnpm typecheck`     | Run `tsc --noEmit`                |
| `pnpm format`        | Format with Prettier              |
| `pnpm format:check`  | Verify formatting without writing |
| `pnpm test`          | Run Vitest in watch mode          |
| `pnpm test:run`      | Run Vitest once                   |
| `pnpm test:coverage` | Run Vitest with coverage          |

`.github/workflows/ci.yml` runs formatting, lint, typecheck, tests, and a
production build on every push to `main` and on every pull request.

## Project Structure

```
src/
├── app/
│   ├── (protected)/            # Routes requiring authentication
│   │   ├── layout.tsx          # Session guard for all nested routes
│   │   ├── dashboard/
│   │   └── profile/            # Editable profile (name, username, avatar)
│   ├── api/auth/[...all]/      # better-auth handler
│   ├── forgot-password/        # Request a reset link
│   ├── reset-password/         # Consume the reset token
│   ├── sign-in/                # email + password, or email/username
│   ├── sign-up/
│   ├── about/
│   ├── layout.tsx              # Root layout: providers
│   └── page.tsx
├── components/                 # Shared components
│   ├── auth-card.tsx           # Centered shell for auth pages
│   ├── query-provider.tsx      # TanStack Query provider
│   ├── snackbar-provider.tsx   # Redux store + snackbar host
│   ├── social-provider-buttons.tsx
│   ├── sign-out-button.tsx
│   ├── session-list.tsx
│   ├── theme-toggle.tsx
│   └── link.tsx
├── hooks/
│   └── useSnackbar.tsx
├── lib/
│   ├── auth.ts                 # better-auth server instance
│   ├── auth-client.ts          # better-auth client
│   ├── session.ts              # Request-scoped getSession()
│   ├── mail.ts                 # Outbound email seam
│   ├── social-providers.ts     # Which OAuth providers are configured
│   ├── prisma.ts               # Prisma client singleton
│   ├── user-agent.ts           # Session list formatting helpers
│   └── theme.ts                # MUI theme
├── store/                      # Redux Toolkit store
└── validations/
    └── auth.ts                 # Zod schemas (client + server)

prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

## Architecture Notes

### Auth flow

- Server: `src/lib/auth.ts` exposes the better-auth instance, mounted at
  `/api/auth/[...all]`.
- Client: `src/lib/auth-client.ts` exports `authClient` plus the individual
  methods used by the UI.
- Route protection: `src/app/(protected)/layout.tsx` checks the session
  before rendering any nested route. If there is no session, it redirects
  to `/sign-in`.

There is no `middleware.ts` / `proxy.ts` in this project. App Router
layouts are the recommended place for auth checks, and running the check
in both a proxy and a layout would query the session twice per request.

### Reading the session

Always use `getSession()` from `src/lib/session.ts` instead of calling
`auth.api.getSession` directly. It wraps the call in React's `cache` so the
layout and the page below it share a single database query per request.
Calling `auth.api.getSession` directly in both places costs two queries.

### Username + email sign-in

The `username` plugin from better-auth is enabled, so an account has both an
email and a username. `sign-in` accepts either: the form inspects the value
for an `@` and calls `signIn.email` or `signIn.username` accordingly.

`displayUsername` is switched off on both the server and the client plugin —
the `name` field already holds the human-readable display value, so the extra
column would be redundant.

### Server-side validation

Every Zod schema in `src/validations/auth.ts` has a server-side counterpart
(e.g. `signUpServerSchema`, `resetPasswordServerSchema`) that is applied in
the `hooks.before` middleware of `src/lib/auth.ts`.

This matters because the client-side resolver is only a convenience: anyone
can `POST` to `/api/auth/*` and skip the browser form entirely.

### Password reset

`/forgot-password` calls `requestPasswordReset`, `/reset-password` reads the
`?token=` parameter and calls `resetPassword`.

Delivery goes through `sendMail()` in `src/lib/mail.ts`, which is the only
place that needs to change when a provider is wired up. Until then it prints
the reset link to the server console in development and throws in production,
so a broken reset flow can never ship silently.

`revokeSessionsOnPasswordReset` is on, because a reset is usually a reaction
to a compromised account.

### Social sign-in

`src/lib/social-providers.ts` reads the provider credentials from the
environment and is the single source of truth for both the server config and
the UI. A provider is only passed to `betterAuth` and only rendered as a
button when both its `clientId` and `clientSecret` are present — so there is
never a button that does nothing when clicked.

As shipped, no credentials are set and the buttons are hidden. To enable
Google, fill in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`; the button
appears on the next request.

### Rate limiting

`rateLimit` is enabled in production only (better-auth's default), with
tighter windows on the credential endpoints that are worth brute forcing:
sign-in, sign-up, and password reset requests.

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
  `getSession()`.
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
mkdir -p "src/app/(protected)/settings"
touch "src/app/(protected)/settings/page.tsx"
```

The layout handles authentication automatically. No changes to a
middleware matcher are needed.

## Environment Variables

See `.env.example`. Never commit `.env`.
