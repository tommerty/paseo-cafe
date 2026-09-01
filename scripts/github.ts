/**
 * Small, dependency-free GitHub REST API + raw-content helpers shared by
 * scripts/validate-registry.ts and scripts/scan.ts. Uses GITHUB_TOKEN when
 * present (set automatically inside GitHub Actions) to avoid the very low
 * unauthenticated rate limit; falls back to anonymous requests for local dev.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    ...extra,
  }
}

export class GitHubNotFoundError extends Error {}

export async function ghApi<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: authHeaders({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    }),
  })
  if (res.status === 404) throw new GitHubNotFoundError(`404: ${path}`)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `GitHub API ${res.status} for ${path}: ${body.slice(0, 300)}`
    )
  }
  return res.json() as Promise<T>
}

export interface RepoMeta {
  full_name: string
  description: string | null
  default_branch: string
  stargazers_count: number
  open_issues_count: number
  pushed_at: string
  archived: boolean
  topics: string[]
  license: { spdx_id: string } | null
  html_url: string
}

export function fetchRepoMeta(owner: string, repo: string): Promise<RepoMeta> {
  return ghApi<RepoMeta>(`/repos/${owner}/${repo}`)
}

export interface ContentsEntry {
  name: string
  path: string
  type: "file" | "dir" | "symlink" | "submodule"
  download_url: string | null
}

export function listDir(
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<ContentsEntry[]> {
  const cleanPath = path.replace(/^\/+|\/+$/g, "")
  const suffix = cleanPath ? `/${cleanPath}` : ""
  return ghApi<ContentsEntry[]>(
    `/repos/${owner}/${repo}/contents${suffix}?ref=${encodeURIComponent(ref)}`
  )
}

export function rawUrl(
  owner: string,
  repo: string,
  ref: string,
  path: string
): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`
}

export async function fetchRawText(
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<string | null> {
  const res = await fetch(rawUrl(owner, repo, ref, path))
  if (!res.ok) return null
  return res.text()
}

export async function fetchRawJson<T>(
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<T | null> {
  const text = await fetchRawText(owner, repo, ref, path)
  if (text === null) return null
  return JSON.parse(text) as T
}
