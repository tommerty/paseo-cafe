import { createFileRoute, Link } from "@tanstack/react-router"
import { IconArrowRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        A directory of paseo.sh plugins
      </h1>
      <p className="mx-auto max-w-xl text-foreground/70">
        Browse community-built{" "}
        <a href="https://paseo.sh" className="underline underline-offset-4">
          Paseo
        </a>{" "}
        plugins. Every listing is generated straight from each plugin's own repo
        — no forms to fill out, just point us at the code.
      </p>
      <div className="flex justify-center gap-3">
        <Button nativeButton={false} render={<Link to="/plugins" />}>
          Browse plugins <IconArrowRight className="size-4" />
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={
            <a href="https://github.com/paseo-plugins/paseo-plugins/blob/main/README.md#submitting-a-plugin" />
          }
        >
          Submit your plugin
        </Button>
      </div>
    </div>
  )
}
