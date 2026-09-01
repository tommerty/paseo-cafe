import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/plugins")({ component: PluginsLayout })

function PluginsLayout() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Outlet />
    </div>
  )
}
