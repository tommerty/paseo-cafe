import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const Route = createRootRoute({
  // Deliberately just charset/viewport/stylesheet/a bare title+description
  // fallback here — NOT the full seo() helper. TanStack Router overrides
  // same-keyed `meta` entries from child routes, but concatenates `links`
  // rather than deduping them, so a canonical link here would render
  // alongside every route's own canonical instead of being replaced by it.
  // Every actual page route provides its own full seo() (title, OG,
  // Twitter, canonical) — this is only what renders if one somehow doesn't.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-mono text-6xl font-semibold text-foreground/20">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-foreground/60">
        The page you're looking for doesn't exist, or the plugin may have been
        removed from the registry.
      </p>
      <div className="mt-2 flex gap-3">
        <Button nativeButton={false} render={<Link to="/" />}>
          Go home
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/plugins" />}
        >
          Browse plugins
        </Button>
      </div>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-svh flex-col">
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
