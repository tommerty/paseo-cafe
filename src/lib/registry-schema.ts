import { z } from "zod"

/**
 * A registry entry is the *only* thing a plugin author writes by hand. It is
 * a pointer at a repo (and optional subpath, since several authors publish a
 * monorepo of plugins) plus a couple of curator-assigned hints. Everything
 * else shown on the site is derived by the scanner (see scripts/scan.ts)
 * from files that already live in the plugin's own repo.
 */
export const registryEntrySchema = z
  .object({
    /** Kebab-case slug. Must match the filename: registry/<id>.json */
    id: z
      .string()
      .min(2)
      .max(64)
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "id must be lowercase kebab-case, e.g. 'subagent-activity'"
      ),
    /** GitHub "owner/repo". Just the repo, not a full URL. */
    repo: z
      .string()
      .regex(/^[\w.-]+\/[\w.-]+$/, "repo must be in the form 'owner/repo'"),
    /**
     * Subpath within the repo containing paseo-plugin.json, for authors who
     * publish several plugins from one repo. Omit for single-plugin repos.
     */
    path: z.string().optional(),
    /** Optional curator/author-assigned categories, refined over time. */
    categories: z.array(z.string().min(1)).default([]),
    /** GitHub username of whoever submitted the PR, for attribution. */
    submittedBy: z.string().optional(),
  })
  .strict()

export type RegistryEntry = z.infer<typeof registryEntrySchema>
