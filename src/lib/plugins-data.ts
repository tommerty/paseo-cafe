import { createServerFn } from "@tanstack/react-start"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { z } from "zod"
import { pluginRecordSchema } from "@/lib/plugin-schema"
import type { PluginRecord } from "@/lib/plugin-schema"

// NOTE: plain createServerFn for now — this reads data/plugins.json off disk
// on every request, which is fine for local dev. When we wire up the static
// GitHub Pages build, wrap this with `staticFunctionMiddleware` (see
// https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
// so it's inlined at build time instead of needing a server at runtime.
export const getPlugins = createServerFn({ method: "GET" }).handler(
  async (): Promise<PluginRecord[]> => {
    const path = join(process.cwd(), "data", "plugins.json")
    const raw = JSON.parse(await readFile(path, "utf8"))
    return z.array(pluginRecordSchema).parse(raw)
  }
)
