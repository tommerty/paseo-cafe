/** Single source of truth for site identity — used by SEO meta, OG image generation, and the sitemap. */
export const SITE_NAME = "paseo.cafe"
export const SITE_TAGLINE = "A directory of paseo.sh plugins"
export const SITE_DESCRIPTION =
  "An independent, community-run directory of paseo.sh plugins, generated straight from each plugin's own GitHub repo."
export const SITE_REPO = "tommerty/paseo-cafe"

// TODO: point this at a custom domain once one exists. Falls back to the
// GitHub Pages project-page URL this repo would deploy to. Used to build
// absolute canonical/OG URLs and the sitemap, so keep it accurate.
export const SITE_URL = "https://tommerty.github.io/paseo-cafe"
