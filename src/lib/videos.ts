import type { VideoEmbed } from "@/lib/plugin-schema"

const MAX_VIDEOS = 4

// YouTube video IDs are always 11 chars of [A-Za-z0-9_-]. Matches watch/embed/
// shorts URLs and the youtu.be short form.
const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/g

const LOOM_RE = /loom\.com\/share\/([a-zA-Z0-9]+)/g

// An explicit <video src="..."> tag, which is how GitHub-rendered READMEs
// commonly wrap a dropped-in video for autoplay/controls/poster attributes.
const VIDEO_TAG_RE = /<video[^>]*\ssrc=["']([^"'<>]+)["'][^>]*>/gi

// A bare link ending in a known video file extension.
const VIDEO_FILE_RE =
  /(https?:\/\/[^\s<>")]+\.(?:mp4|webm|mov|m4v))(?:[?#][^\s<>")]*)?/gi

// GitHub's asset-hosting URLs — from dragging a file into a README/PR
// editor — carry no file extension: github.com/user-attachments/assets/<uuid>
// (current) or github.com/<owner>/<repo>/assets/<user-id>/<uuid> (legacy).
// Images and videos are indistinguishable at the URL level; resolving which
// is which needs a network call, so this only extracts candidates — see
// resolveGitHubAssetVideos.
const GITHUB_ASSET_RE =
  /https:\/\/github\.com\/(?:user-attachments\/assets\/[\w-]+|[\w.-]+\/[\w.-]+\/assets\/\d+\/[\w-]+)/g

/**
 * Best-effort extraction of embeddable demo videos from a README. Every URL
 * rendered by the site is built here from a regex-matched, sanitized ID or
 * an http(s)+known-extension match — never from raw attacker-controlled
 * markup — so there's nothing here for a malicious README to inject.
 */
export function extractVideos(readme: string): VideoEmbed[] {
  const videos: VideoEmbed[] = []
  const seen = new Set<string>()

  const add = (video: VideoEmbed, dedupeKey: string) => {
    if (seen.has(dedupeKey) || videos.length >= MAX_VIDEOS) return
    seen.add(dedupeKey)
    videos.push(video)
  }

  for (const match of readme.matchAll(YOUTUBE_RE)) {
    const id = match[1]
    add(
      {
        kind: "youtube",
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      },
      `youtube:${id}`
    )
  }

  for (const match of readme.matchAll(LOOM_RE)) {
    const id = match[1]
    add(
      { kind: "loom", id, embedUrl: `https://www.loom.com/embed/${id}` },
      `loom:${id}`
    )
  }

  for (const match of readme.matchAll(VIDEO_TAG_RE)) {
    const url = match[1]
    if (url.startsWith("http://") || url.startsWith("https://")) {
      add({ kind: "file", url }, `file:${url}`)
    }
  }

  for (const match of readme.matchAll(VIDEO_FILE_RE)) {
    add({ kind: "file", url: match[1] }, `file:${match[1]}`)
  }

  return videos
}

/** Every distinct GitHub asset-hosting URL in a README, in order of first appearance. */
export function extractGitHubAssetLinks(readme: string): string[] {
  const urls = new Set<string>()
  for (const match of readme.matchAll(GITHUB_ASSET_RE)) urls.add(match[0])
  return Array.from(urls)
}

/**
 * Resolves which of a README's ambiguous GitHub asset links are actually
 * videos, by asking GitHub for each one's real content type (GitHub 302s
 * these to a presigned S3 URL whose `response-content-type` query param
 * carries the real type — see scripts/github.ts's resolveGitHubAssetContentType).
 * `resolveContentType` is injected so this stays testable without a real
 * network call. `existing` is whatever extractVideos already found (e.g. an
 * asset link explicitly wrapped in `<video src>` is already a "file" entry)
 * — skipped for dedup and counted toward the same cap.
 */
export async function resolveGitHubAssetVideos(
  readme: string,
  resolveContentType: (url: string) => Promise<string | null>,
  existing: VideoEmbed[] = []
): Promise<VideoEmbed[]> {
  const existingUrls = new Set(
    existing.filter((v) => v.kind === "file").map((v) => v.url)
  )
  const found: VideoEmbed[] = []

  for (const url of extractGitHubAssetLinks(readme)) {
    if (existingUrls.has(url)) continue
    if (existing.length + found.length >= MAX_VIDEOS) break
    const contentType = await resolveContentType(url)
    if (contentType?.startsWith("video/")) found.push({ kind: "file", url })
  }

  return found
}
