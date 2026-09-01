#!/usr/bin/env bun
/**
 * The "plumb for paseo" scanner. Walks every registry/*.json entry, reads
 * whatever metadata already exists in the plugin's own repo (paseo-plugin.json,
 * package.json, README, LICENSE, images/), asks the GitHub API for repo
 * stats, and writes the result to data/plugins/<id>.json + an aggregate
 * data/plugins.json index. This is the only place plugin metadata is
 * computed — the site never talks to GitHub directly.
 *
 * A single broken/renamed/deleted plugin repo does not fail the whole run:
 * its record is written with `scanError` set and health flags at their
 * safest defaults, so the listing can surface it as "needs attention"
 * instead of the whole build breaking.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { registryEntrySchema } from "../src/lib/registry-schema.ts"
import { pluginRecordSchema } from "../src/lib/plugin-schema.ts"
import type { PluginRecord } from "../src/lib/plugin-schema.ts"
import { extractInstallSection, firstParagraph } from "../src/lib/readme.ts"
import { renderMarkdownToHtml } from "../src/lib/markdown.ts"
import { extractVideos, resolveGitHubAssetVideos } from "../src/lib/videos.ts"
import {
  GitHubNotFoundError,
  fetchRawJson,
  fetchRawText,
  fetchRepoMeta,
  listDir,
  rawUrl,
  resolveGitHubAssetContentType,
} from "./github.ts"

// Scripts are always invoked via `bun run` from the repo root (see package.json).
const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, "registry")
const OUTPUT_DIR = join(ROOT, "data", "plugins")
const INDEX_PATH = join(ROOT, "data", "plugins.json")
const RECENT_DAYS = 180

interface PackageJson {
  name?: string
  description?: string
  version?: string
  author?: string | { name?: string }
  license?: string
  scripts?: Record<string, string>
}

function authorName(author: PackageJson["author"]): string | undefined {
  if (!author) return undefined
  return typeof author === "string" ? author : author.name
}

function isRecent(iso: string): boolean {
  const pushed = new Date(iso).getTime()
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
  return pushed >= cutoff
}

async function scanOne(entryFile: string): Promise<PluginRecord> {
  const raw = JSON.parse(readFileSync(join(REGISTRY_DIR, entryFile), "utf8"))
  const entry = registryEntrySchema.parse(raw)
  const [owner, repo] = entry.repo.split("/")
  const scannedAt = new Date().toISOString()
  const prefix = entry.path ? `${entry.path}/` : ""
  const fallbackUrl = `https://github.com/${entry.repo}${entry.path ? `/tree/HEAD/${entry.path}` : ""}`

  const base: PluginRecord = {
    id: entry.id,
    repo: entry.repo,
    path: entry.path,
    url: fallbackUrl,
    name: entry.id,
    description: "",
    categories: entry.categories,
    health: {
      manifestValid: false,
      hasReadme: false,
      hasLicense: false,
      hasTests: false,
      hasTypecheckScript: false,
      updatedRecently: false,
    },
    images: [],
    videos: [],
    scannedAt,
  }

  try {
    const repoMeta = await fetchRepoMeta(owner, repo)
    const branch = repoMeta.default_branch
    const dirEntries = await listDir(owner, repo, entry.path ?? "", branch)
    const byName = new Map(dirEntries.map((e) => [e.name, e]))

    const manifest = await fetchRawJson<Record<string, unknown>>(
      owner,
      repo,
      branch,
      `${prefix}paseo-plugin.json`
    )
    const pkg = await fetchRawJson<PackageJson>(
      owner,
      repo,
      branch,
      `${prefix}package.json`
    )

    const readmeEntry = byName.get("README.md") ?? byName.get("readme.md")
    const readme = readmeEntry
      ? await fetchRawText(owner, repo, branch, readmeEntry.path)
      : null

    const hasLicenseFile =
      byName.has("LICENSE") || byName.has("LICENSE.md") || byName.has("license")
    const imagesDirEntry = byName.get("images")
    const images =
      imagesDirEntry?.type === "dir"
        ? await listDir(owner, repo, imagesDirEntry.path, branch)
        : []

    const manifestId =
      typeof manifest?.id === "string" ? manifest.id : undefined
    const manifestName =
      typeof manifest?.name === "string" ? manifest.name : undefined
    const manifestDescription =
      typeof manifest?.description === "string"
        ? manifest.description
        : undefined

    const installNotes = extractInstallSection(readme ?? "")
    const installNotesHtml = installNotes
      ? await renderMarkdownToHtml(installNotes)
      : undefined

    const readmeVideos = extractVideos(readme ?? "")
    const assetVideos = readme
      ? await resolveGitHubAssetVideos(
          readme,
          resolveGitHubAssetContentType,
          readmeVideos
        )
      : []
    const videos = [...readmeVideos, ...assetVideos]

    const record: PluginRecord = {
      id: entry.id,
      repo: entry.repo,
      path: entry.path,
      url: `https://github.com/${entry.repo}${entry.path ? `/tree/${branch}/${entry.path}` : ""}`,
      name: pkg?.name ?? manifestName ?? entry.id,
      description:
        pkg?.description ??
        manifestDescription ??
        firstParagraph(readme ?? "") ??
        "",
      version: pkg?.version,
      author: authorName(pkg?.author),
      license: repoMeta.license?.spdx_id ?? pkg?.license,
      categories: entry.categories,
      // raw JSON.parse output is always JSON-compatible; the broader
      // Record<string, unknown> return type of fetchRawJson just isn't
      // narrow enough for the schema's JSON-value type.
      manifest: (manifest as PluginRecord["manifest"]) ?? undefined,
      installNotes,
      installNotesHtml,
      owner: {
        login: repoMeta.owner.login,
        avatarUrl: repoMeta.owner.avatar_url,
        url: repoMeta.owner.html_url,
      },
      repoMeta: {
        stars: repoMeta.stargazers_count,
        openIssues: repoMeta.open_issues_count,
        defaultBranch: branch,
        pushedAt: repoMeta.pushed_at,
        topics: repoMeta.topics,
        archived: repoMeta.archived,
        license: repoMeta.license?.spdx_id ?? null,
      },
      health: {
        manifestValid: Boolean(manifestId),
        hasReadme: Boolean(readme),
        hasLicense: hasLicenseFile || Boolean(repoMeta.license),
        hasTests:
          Boolean(pkg?.scripts?.test) ||
          dirEntries.some((e) => /test/i.test(e.name)),
        hasTypecheckScript: Boolean(pkg?.scripts?.typecheck),
        updatedRecently: isRecent(repoMeta.pushed_at),
      },
      images: images
        .filter((e) => e.type === "file")
        .map((e) => rawUrl(owner, repo, branch, e.path)),
      videos,
      scannedAt,
    }

    if (!manifestId) {
      record.scanError = "paseo-plugin.json missing or missing an 'id' field"
    }

    return pluginRecordSchema.parse(record)
  } catch (err) {
    const message =
      err instanceof GitHubNotFoundError
        ? `repo/path not found on GitHub: ${entry.repo}${entry.path ? `/${entry.path}` : ""}`
        : `scan failed: ${(err as Error).message}`
    return pluginRecordSchema.parse({ ...base, scanError: message })
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const files = readdirSync(REGISTRY_DIR).filter((f) => f.endsWith(".json"))

  const records: PluginRecord[] = []
  for (const file of files) {
    console.log(`Scanning ${file}...`)
    const record = await scanOne(file)
    if (record.scanError) console.warn(`  ! ${record.scanError}`)
    records.push(record)
    writeFileSync(
      join(OUTPUT_DIR, `${record.id}.json`),
      `${JSON.stringify(record, null, 2)}\n`
    )
  }

  records.sort((a, b) => a.name.localeCompare(b.name))
  writeFileSync(INDEX_PATH, `${JSON.stringify(records, null, 2)}\n`)

  const ok = records.filter((r) => !r.scanError).length
  console.log(
    `\nWrote ${records.length} record(s) (${ok} clean, ${records.length - ok} with warnings) to data/plugins.json`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
