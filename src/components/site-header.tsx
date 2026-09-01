import { Link } from "@tanstack/react-router"
import { IconBrandGithub, IconPuzzle } from "@tabler/icons-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useIsMobile } from "@/hooks/use-mobile"

export function SiteHeader() {
  const isMobile = useIsMobile()

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-medium">
          <IconPuzzle className="size-5" />
          {!isMobile ? <span>paseo-plugins</span> : null}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-foreground/70">
          <Link
            to="/plugins"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {isMobile ? "Browse" : "Browse plugins"}
          </Link>
          <Link
            to="/submit"
            className="hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {isMobile ? "Submit" : "Submit a plugin"}
          </Link>
          {!isMobile ? (
            <a
              href="https://paseo.sh"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              paseo.sh
            </a>
          ) : null}
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
