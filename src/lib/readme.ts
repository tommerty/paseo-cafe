/** Pure, best-effort markdown README parsing shared by scripts/scan.ts and its tests. */

/** Strip markdown noise (headings, badges, images) and return the first real paragraph. */
export function firstParagraph(readme: string): string | undefined {
  const lines = readme.split("\n")
  const buffer: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === "") {
      if (buffer.length > 0) break
      continue
    }
    if (trimmed.startsWith("#")) continue
    if (/^\[!\[/.test(trimmed)) continue // badge rows
    if (/^<img/i.test(trimmed) || /^<p align/i.test(trimmed)) continue
    buffer.push(trimmed)
  }
  const text = buffer.join(" ").trim()
  return text.length > 0 ? text.slice(0, 400) : undefined
}

const INSTALL_HEADING =
  /^(install(?:ation|ing)?|setup|getting started|quick ?start)$/i
const MAX_INSTALL_NOTES_LENGTH = 1500

/**
 * Best-effort extraction of an "Install"/"Setup"/"Getting started" section
 * from a README: everything under the first heading whose *own* text matches
 * (not "Uninstalling", since matching is anchored to the whole heading, not
 * a substring), up to the next heading at the same or a shallower level.
 * Deliberately supplementary — the always-correct install command comes
 * from src/lib/install-command.ts, not from this parsing.
 */
export function extractInstallSection(readme: string): string | undefined {
  const lines = readme.split("\n")
  let capturing = false
  let capturedLevel = 0
  const buffer: string[] = []

  for (const line of lines) {
    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(line)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      if (capturing && level <= capturedLevel) break
      if (!capturing && INSTALL_HEADING.test(text)) {
        capturing = true
        capturedLevel = level
        continue
      }
    }
    if (capturing) buffer.push(line)
  }

  const text = buffer.join("\n").trim()
  if (!text) return undefined
  return text.length > MAX_INSTALL_NOTES_LENGTH
    ? `${text.slice(0, MAX_INSTALL_NOTES_LENGTH)}…`
    : text
}
