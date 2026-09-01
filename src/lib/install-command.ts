import type { PluginRecord } from "@/lib/plugin-schema"

/**
 * The canonical install command for a plugin — derived purely from the
 * repo/path already validated in its registry entry, using the real
 * `paseo plugin add` CLI (see https://paseo.sh/docs/plugins/reference).
 * This never depends on README parsing, so it's always correct even when
 * an author's own install instructions are missing, stale, or inconsistent.
 */
export function getInstallCommand(
  plugin: Pick<PluginRecord, "repo" | "path">
): string {
  return plugin.path
    ? `paseo plugin add ${plugin.repo} --path ${plugin.path}`
    : `paseo plugin add ${plugin.repo}`
}
