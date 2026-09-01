import { z } from "zod"

/**
 * The enriched, generated record for one plugin. Never hand-authored — the
 * scanner (scripts/scan.ts) produces data/plugins/<id>.json in this shape by
 * reading the plugin's paseo-plugin.json, package.json, README, LICENSE,
 * images/, and the GitHub repo API. The site only ever reads this shape.
 */
export const pluginHealthSchema = z.object({
  manifestValid: z.boolean(),
  hasReadme: z.boolean(),
  hasLicense: z.boolean(),
  hasTests: z.boolean(),
  hasTypecheckScript: z.boolean(),
  updatedRecently: z.boolean(),
})

export const pluginRepoMetaSchema = z.object({
  stars: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  defaultBranch: z.string(),
  pushedAt: z.string(),
  topics: z.array(z.string()).default([]),
  archived: z.boolean().default(false),
  license: z.string().nullable().default(null),
})

/**
 * A demo video found by best-effort scanning of the README (see
 * src/lib/videos.ts). URLs are always constructed from a matched, sanitized
 * ID (or a URL that itself matched an http(s) + known-video-extension
 * pattern) — never rendered from arbitrary README text directly.
 */
export const videoEmbedSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("youtube"), id: z.string(), embedUrl: z.string().url(), watchUrl: z.string().url() }),
  z.object({ kind: z.literal("loom"), id: z.string(), embedUrl: z.string().url() }),
  z.object({ kind: z.literal("file"), url: z.string().url() }),
])

export const pluginRecordSchema = z.object({
  id: z.string(),
  repo: z.string(),
  path: z.string().optional(),
  url: z.string().url(),
  name: z.string(),
  description: z.string().default(""),
  version: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  categories: z.array(z.string()).default([]),
  manifest: z.record(z.string(), z.json()).optional(),
  repoMeta: pluginRepoMetaSchema.optional(),
  // Best-effort excerpt of an "Install"/"Setup"/"Getting started" README
  // section — supplementary to the always-correct generated install
  // command (see src/lib/install-command.ts), for anything extra the
  // author called out (env vars, prerequisites, etc). installNotesHtml is
  // installNotes rendered to sanitized HTML at scan time (src/lib/markdown.ts)
  // — the only thing the site actually renders.
  installNotes: z.string().optional(),
  installNotesHtml: z.string().optional(),
  health: pluginHealthSchema,
  images: z.array(z.string()).default([]),
  scanError: z.string().optional(),
  scannedAt: z.string(),
})

export type PluginHealth = z.infer<typeof pluginHealthSchema>
export type PluginRepoMeta = z.infer<typeof pluginRepoMetaSchema>
export type PluginRecord = z.infer<typeof pluginRecordSchema>
