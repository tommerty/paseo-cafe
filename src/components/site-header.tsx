import { Link } from "@tanstack/react-router"
import { IconBrandGithub, IconPuzzle } from "@tabler/icons-react"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-medium">
          <IconPuzzle className="size-5" />
          <span>paseo-plugins</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-foreground/70">
          <Link
            to="/plugins"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Browse plugins
          </Link>
          <a
            href="https://paseo.sh"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            paseo.sh
          </a>
          <a
            href="https://github.com/paseo-plugins/paseo-plugins"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <IconBrandGithub className="size-5" />
          </a>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
