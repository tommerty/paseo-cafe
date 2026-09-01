# paseo.cafe

A directory of community-built [Paseo](https://paseo.sh) plugins. Every listing is generated
from the plugin's own repo — authors don't fill out a form, they just point us at their code.

## How it works

```
registry/<id>.json      →  scripts/validate-registry.ts (CI, on PR)
                         →  scripts/scan.ts              (CI, on merge + nightly)
                         →  data/plugins/<id>.json + data/plugins.json
                         →  src/routes/plugins.*.tsx (reads data/plugins.json)
```

1. **`registry/*.json`** is the only thing a human writes — a pointer at a repo (see
   [Submitting a plugin](#submitting-a-plugin)).
2. **`scripts/validate-registry.ts`** runs on every PR that touches `registry/`. It checks the
   entry is well-formed, the repo/path exists, and a valid `paseo-plugin.json` manifest is there.
   This is the entire review burden for merging — see `.github/workflows/validate.yml`.
3. **`scripts/scan.ts`** ("plumb for paseo") runs on merge to `main` and nightly. It reads
   `paseo-plugin.json`, `package.json`, `README.md`, `LICENSE`, and `images/` straight from each
   plugin's repo, plus GitHub API metadata (stars, last commit, topics, license), and writes the
   generated, never-hand-edited records in `data/plugins/` and `data/plugins.json`. See
   `.github/workflows/enrich-and-deploy.yml`.
4. The site (`src/routes/plugins.index.tsx`, `src/routes/plugins.$id.tsx`) reads
   `data/plugins.json` via `src/lib/plugins-data.ts` — it never talks to GitHub directly.

Deploying the build to GitHub Pages is deliberately not wired up yet (see the TODO in
`enrich-and-deploy.yml`); everything above runs and is verifiable locally today.

## Submitting a plugin

Add one file, `registry/<your-plugin-id>.json`:

```jsonc
{
  "id": "your-plugin-id", // must match the filename
  "repo": "yourname/your-repo", // GitHub "owner/repo", not a full URL
  "path": "optional/subpath", // omit if your repo *is* the plugin
  "categories": ["productivity"], // free-form, refined over time
  "submittedBy": "yourname"
}
```

Requirements, checked automatically by CI:

- Your repo (at `path`, if given) contains a valid `paseo-plugin.json` with an `id`.
- `id` is unique across the registry and matches the filename.

Everything else — name, description, version, license, screenshots, stars — is read from your
repo automatically. A `README.md`, `LICENSE`, and an `images/` folder with screenshots all make
your listing better; none are required to get in.

Open a PR adding your `registry/<id>.json`. If `validate.yml` passes, it's ready to merge.

## Local development

```bash
bun install
bun run registry:validate   # check registry/*.json against live GitHub repos
bun run registry:scan       # regenerate data/plugins/*.json + data/plugins.json
bun run dev                 # http://localhost:3000
```

Other useful scripts: `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.

## Stack

TanStack Start (file-based routes under `src/routes/`), shadcn/ui (`src/components/ui/`,
base-ui-flavored — polymorphism uses `render`, not `asChild`), Tailwind v4, Zod for both the
registry schema (`src/lib/registry-schema.ts`) and the generated plugin schema
(`src/lib/plugin-schema.ts`).
