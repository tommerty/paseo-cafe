export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-foreground/50">
        <p>
          <strong className="text-foreground/70">paseo-plugins</strong> is an
          independent, community-run directory. It is not affiliated with,
          endorsed by, or maintained by{" "}
          <a
            href="https://paseo.sh"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-3 hover:text-foreground"
          >
            paseo.sh
          </a>
          .
        </p>
        <p className="mt-1">
          Every listing is generated automatically from a plugin's own public
          repository — nothing here is reviewed, audited, or vouched for by this
          site. Read a plugin's source before installing it. See each plugin's
          page for details.
        </p>
      </div>
    </footer>
  )
}
