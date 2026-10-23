# White Label Utility List

White Label Utility List is an open, white-label application for managing a **configurable list of records**, built with [Next.js](https://nextjs.org). Administrators define the shape of the data (fields, reusable option lists, composite objects, and table columns) at runtime, without code changes or migrations. Users then create, filter, edit, and export records through forms that are generated automatically.

The default brand is **ListFlow**, but the name, colors, logo, and copy are all meant to be replaced. You can fork, rebrand, and deploy your own list-based system (inventory, contacts, assets, requests, anything tabular) on top of it.

## Concept

The goal of this project is to provide a solid, ready-to-use foundation for list management that is free to use and adapt. "White label" means you are welcome to customize the branding, theme, copy, and business rules to fit your own product or your client's product.

**The only condition for using this project (white-labeled or not) is keeping the attribution footer in place.** Every screen must keep a footer crediting the original author with a "Created by..." line linking to:

[Vinícius Nolêto de Araújo — LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)

Do not remove or hide this link when reusing, forking, or white-labeling this project. It is rendered by `components/layout/AttributionFooter.tsx`.

## Features

### Records list (`/list`) — all approved users

- Paginated table of records with selectable page size (10, 15, 25, 50, 100).
- **Create, edit, and delete** records through forms generated from the configured fields, with validation (required fields, types).
- **Filters** by any column (case-insensitive partial match), including sub-fields of objects. Several filters can be combined, and filters, page, and page size are kept in the URL so a view can be shared or bookmarked.
- **Excel export (`.xlsx`)** of all records or only the filtered ones. Before downloading, the app shows the row count and estimated file size.
- Values are formatted for display: dates as `DD/MM/YYYY`, and option-list values as plain text or colored badges.

### Settings (`/admin/settings`) — admins only

The data model is configured in four sections:

| Section | What it does |
|---|---|
| **Fields** | Fields that make up a record. Each field has a key, label, type, a required flag, and a position. Types: `text`, `long_text`, `number`, `date`, `select` (backed by an internal list), and `object` (backed by an object). |
| **Internal lists** | Reusable option sets for `select` fields. Each list has items with a label, position, and optional color, and is displayed as plain text or as colored badges. |
| **Objects** | Composite types: a named group of sub-fields (same types as fields, except `object`). A field of type `object` renders all of its sub-fields together. |
| **Columns** | Which values appear in the table and the export, and in what order. A column points to a field, or to a sub-field of an object field. |

Fields, list items, object fields, and columns can be reordered by **drag and drop**.

### Users and access (`/admin/users`) — admins only

- Anyone can sign up at `/auth/register`. New accounts start as **pending** and cannot log in until an admin **approves** them. Admins can also reject an account, which revokes any sessions it already has.
- Two roles: `user` (records list) and `admin` (records list plus settings and user management).
- The first admin account is created by the database seed (see below).

### Authentication

- Access token + refresh token pair stored in cookies. The access token is short-lived (2 minutes) and the refresh token lasts 30 days. Tokens are stored hashed in the database.
- Refresh tokens are rotated on use and grouped by token family, so a reused token can be detected and its whole family revoked.
- Tokens are renewed transparently: on navigation by `proxy.ts`, and on API calls by the HTTP client, which queues concurrent requests while a refresh is in progress.

### Interface

- **Light and dark mode**, toggled from the header. The choice is saved across reloads.
- **Three languages**: Portuguese (pt-BR), Spanish (es-MX), and English (en-US), switchable at runtime. API messages are returned in all three locales.
- Responsive layout with a collapsible sidebar.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Route Handlers, standalone output) + [React](https://react.dev) 19
- [Mantine](https://mantine.dev) (UI components) + [Tailwind CSS](https://tailwindcss.com) 4
- [TanStack Query](https://tanstack.com/query) (data fetching/caching) + [Zustand](https://zustand.docs.pmnd.rs) (auth store)
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL 16
- [Yup](https://github.com/jquense/yup) (schema validation)
- [i18next](https://www.i18next.com) (internationalization)
- [dnd-kit](https://dndkit.com) (drag-and-drop reordering)
- [ExcelJS](https://github.com/exceljs/exceljs) (spreadsheet export)
- [Vitest](https://vitest.dev) + Testing Library (unit) and [Playwright](https://playwright.dev) (end-to-end)

## Installation

### Prerequisites

- **With Docker:** Docker with Docker Compose v2, and `make`.

### 1. Configure the environment

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `APP_ENV` | Selects the compose file used by the Makefile: `local`, `homolog`, or `production` (`docker-compose.${APP_ENV}.yml`). |
| `APP_PORT` | Host port: the app itself in `local`, and nginx HTTP in `homolog`. `production` always uses ports 80 and 443. |
| `APP_SSL_PORT` | **Homolog only.** Host port for nginx HTTPS (default `443`). |
| `NEXT_PUBLIC_APP_NAME` | Brand name shown in the UI. Defaults to `ListFlow`. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database credentials. The Postgres container is created with these values. |
| `POSTGRES_PORT` | Port Postgres listens on, and the port the app connects to. It is also published on the host in `local`. |
| `POSTGRES_HOST` | Database host. Keep `white-label-utility-list-postgres` when using Docker, or use `localhost` when running without Docker. |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | First admin account, created by the seed. If any of them is empty, the seed skips admin creation. |

> Fill in the `SEED_ADMIN_*` variables **before** installing. Otherwise no admin account will exist, and new sign-ups can only be approved by an admin.

### 2a. Local development with Docker

```bash
make install
```

This single command builds the image, installs dependencies, starts the app and Postgres containers, runs the migrations, and runs the seed. When it finishes, open `http://localhost:${APP_PORT}` and log in with the `SEED_ADMIN_*` credentials.

The project folder is mounted into the container and the app runs with `npm run dev`, so code changes are picked up live.

Useful commands:

| Command | Description |
|---|---|
| `make up` / `make down` / `make restart` | Start (detached), stop, or restart the containers. |
| `make watch` | Start the containers attached, streaming their output. |
| `make logs` | Show the app container logs. |
| `make db-migrate` | Apply pending migrations. |
| `make db-seed` | Run the seed again (it is idempotent: an existing admin is skipped). |
| `make install-deps` | Run `npm install` inside the container. |
| `make exec c="<command>"` | Run any command in the app container, e.g. `make exec c="npm test"`. |
| `make in-front` | Open a shell in the app container. |
| `make lint` | Run ESLint. |

### 3. Deploying (homolog / production)

Set `APP_ENV=homolog` or `APP_ENV=production` in `.env`, with strong database credentials, and then run:

```bash
make build
make up
```

These environments run three containers:

| Container | Role |
|---|---|
| `white-label-utility-list-front` | The app, built by `configs/docker/node/Dockerfile.deploy`: a multi-stage build that runs `next build` and serves the Next.js standalone output (`node server.js`). It is not published on the host. |
| `white-label-utility-list-server` | nginx (`configs/docker/nginx/`), the only container published on the host, acting as a reverse proxy for the app. It has `certbot` installed for HTTPS and shows `nginx-502-page.html` while the app is down. Production publishes ports **80** and **443**. Homolog publishes **`APP_PORT`** (HTTP) and **`APP_SSL_PORT`** (HTTPS). |
| `white-label-utility-list-postgres` | PostgreSQL. It is not published on the host. |

To ship a new version of the app without touching the other containers, run `make update-build`.

#### HTTPS

The certificate is issued by Let's Encrypt with `certbot` inside the nginx container. Certificates are stored in the host's `/etc/letsencrypt/`, which is mounted into the container, so they survive rebuilds.

1. Point the domain's DNS to the server and open the HTTP and HTTPS ports (80 and 443; in homolog, `APP_PORT` and `APP_SSL_PORT`). Let's Encrypt validates the domain over **port 80**, so in homolog `make certbot` only works with `APP_PORT=80`.
2. In `configs/docker/nginx/conf/route.conf`, replace `server_name _;` with your domain, then run `make nginx-reload`.
3. Issue the certificate:

   ```bash
   make certbot d=your-domain.com
   ```

   Certbot edits `route.conf`, which is mounted from the repository: it adds `listen 443 ssl`, the certificate paths, and the HTTP → HTTPS redirect. Then it reloads nginx.
4. Certificates expire after 90 days. Schedule renewal on the host, for example with a weekly cron job running `make certbot-renew` from the project folder.

Both homolog and production must be served over HTTPS. The deploy image runs with `NODE_ENV=production`, so auth cookies are set with `Secure`, and browsers drop them over plain HTTP, so login does not work until the certificate is in place.

| Command | Description |
|---|---|
| `make certbot d=<domain>` | Issue a certificate and configure nginx for HTTPS. |
| `make certbot-renew` | Renew certificates that are close to expiring. |
| `make nginx-reload` | Reload the nginx configuration. |
| `make logs-server` | Show the nginx container logs. |

The deploy image contains only the compiled app, not `drizzle-kit` or the source, so `make db-migrate` and `make db-seed` do not work in these environments. Run migrations and the seed from a one-off container attached to the app network instead:

```bash
docker run --rm \
  --network white-label-utility-list-network \
  --env-file .env \
  -v "$PWD":/app -w /app \
  node:lts-alpine \
  sh -c "npm ci && npm run db:migrate && npm run db:seed"
```

Run it after the first `make up`, and again (migrations only) whenever new migrations are added.

## Database

The schema lives in `db/schema/` and the generated SQL migrations live in `db/migrations/`.

| Script | Description |
|---|---|
| `npm run db:generate` | Generate a new migration after changing the schema. |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run db:push` | Push the schema directly, without a migration (prototyping only). |
| `npm run db:seed` | Create the first admin account from `SEED_ADMIN_*`. |
| `npm run db:studio` | Open Drizzle Studio to browse the data. |

Records are stored as JSONB (`list_records.values`) keyed by field key. That is why fields can be added or changed from the settings screen without migrations.

## Tests

```bash
npm test                # unit tests (Vitest)
npm run test:watch      # unit tests in watch mode
npm run test:coverage   # unit tests with coverage
npm run test:e2e        # end-to-end tests (Playwright)
npm run test:e2e:ui     # end-to-end tests with the Playwright UI
```

The end-to-end tests need a migrated and seeded database: they log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. By default, they start (or reuse) `npm run dev` on `http://localhost:3000`. Set `E2E_BASE_URL` to run them against an app that is already running, such as the Docker container. Run `npx playwright install chromium` once before the first run.

## White-labeling

| What | Where |
|---|---|
| App name | `NEXT_PUBLIC_APP_NAME` in `.env` (fallback in `shared/constants/brand.ts`) |
| Brand colors (primary / secondary / tertiary) | `shared/constants/colors.js`. Full shade palettes are generated from each base color and used by both Mantine and Tailwind. |
| Logo and favicons | `public/` (`logo.png`, `favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest`) |
| UI copy and translations | `locales/pt-br.ts`, `locales/es-mx.ts`, `locales/en-us.ts` |
| Mantine theme (fonts, radius, etc.) | `libs/matine/mantine-theme.ts` |

Remember: the attribution footer must stay visible on every screen.

## Project structure

```
app/                  Routes (App Router)
  (protected)/list/   Records list
  admin/              Settings and user management
  auth/               Login and registration
  api/                Route Handlers (auth, list-records, list-config, settings, admin)
components/           Global components (form wrappers, table, layout, utils)
resources/{module}/   One module per API resource: models, enums, services, logics, schemas
db/                   Drizzle schema, migrations, and seed
libs/                 Server-side helpers (auth, db, API envelope, filters, validation)
locales/              Translations
configs/docker/       Dockerfiles (app: local and deploy) and nginx config (homolog / production)
tests/                Unit (Vitest) and end-to-end (Playwright) tests
proxy.ts              Route guard and SSR token renewal
```

Coding conventions for contributors (and AI agents) are documented in `AGENTS.md` and `.claude/rules/`.

## License

This project is free to use, modify, and white-label, provided the attribution footer described above (link to the [author's LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/)) is kept visible on every screen. See [LICENSE.md](./LICENSE.md) for the full terms.
