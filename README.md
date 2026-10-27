Use this repository to run and edit the app locally, then publish changes back through.

Any change pushed to the repo will also be reflected in the Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local backend runs on it.

## Run Locally

Three commands, from the project root:

```bash
login   # one-time per machine
link    # one-time per clone
dev     # local backend + frontend together
```

Open the frontend URL that `dev` prints (typically `http://localhost:5173`).

Notes:

- **Every fresh clone needs ` link`.** It writes `/.app.jsonc` (the app-id pointer), which is deliberately gitignored. Your app id is in the Builder URL (`app.com/apps/<id>/...`); ` link --help` shows the non-interactive flags.
- **` dev` runs the frontend for you** (via `site.serveCommand` in this repo's `/config.jsonc`) — never run `npm run dev` yourself: alone it serves a UI with no backend behind it (`[] Proxy not enabled`, every `/api` call fails), and alongside ` dev` the second Vite silently takes the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under ` dev`.** The frontend boots by fetching app settings from the hosted app; before the first publish that fails and every page redirects to login. The local API works regardless.
- Entities, functions, and auth run locally — entity data is **in-memory only**, wiped when ` dev` restarts. Everything else (Core integrations, OAuth login) is forwarded to your

## Frontend Only, Hosted Backend

To work on just the frontend against your app's live hosted backend:

```bash
```

⚠️ In this mode writes go to your app's **production data** — plain keeps everything local.

## Publish Your Changes

After pushing your changes to git, open the dashboard and publish the app:

```bash
```

This repo syncs to through git, so publish from the dashboard rather than ` deploy` — a CLI deploy ships your local tree directly, bypassing the sync, and the deployed state silently diverges from the repo.
