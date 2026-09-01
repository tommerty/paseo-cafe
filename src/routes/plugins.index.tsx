import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { IconPhotoOff, IconSearch, IconStar } from "@tabler/icons-react"
import { getPlugins } from "@/lib/plugins-data"
import type { PluginRecord } from "@/lib/plugin-schema"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/plugins/")({
  component: PluginsIndex,
  loader: () => getPlugins(),
})

function PluginsIndex() {
  const plugins = Route.useLoaderData()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const plugin of plugins) for (const c of plugin.categories) set.add(c)
    return Array.from(set).sort()
  }, [plugins])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return plugins.filter((plugin) => {
      if (category && !plugin.categories.includes(category)) return false
      if (!q) return true
      return (
        plugin.name.toLowerCase().includes(q) ||
        plugin.description.toLowerCase().includes(q) ||
        plugin.id.toLowerCase().includes(q)
      )
    })
  }, [plugins, query, category])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plugins</h1>
        <p className="text-sm text-foreground/60">
          {plugins.length} plugin{plugins.length === 1 ? "" : "s"} generated
          from their source repos.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategory(null)}>
            <Badge variant={category === null ? "default" : "outline"}>
              all
            </Badge>
          </button>
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)}>
              <Badge variant={category === c ? "default" : "outline"}>
                {c}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-foreground/50">
          No plugins match "{query}".
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
        </div>
      )}
    </div>
  )
}

function PluginCard({ plugin }: { plugin: PluginRecord }) {
  return (
    <Link to="/plugins/$id" params={{ id: plugin.id }} className="block">
      <Card className="h-full pt-0 transition-shadow hover:shadow-md">
        <div className="aspect-video w-full shrink-0 overflow-hidden border-b border-border bg-muted">
          {plugin.images[0] ? (
            <img
              src={plugin.images[0]}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <IconPhotoOff className="size-6 text-foreground/20" />
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{plugin.name}</CardTitle>
            {plugin.repoMeta ? (
              <span className="flex shrink-0 items-center gap-1 text-xs text-foreground/50">
                <IconStar className="size-3.5" />
                {plugin.repoMeta.stars}
              </span>
            ) : null}
          </div>
          <CardDescription className="line-clamp-3">
            {plugin.description || "No description available."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {plugin.categories.map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
          {plugin.scanError ? (
            <Badge variant="destructive">needs attention</Badge>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
