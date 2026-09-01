import { describe, expect, it } from "vitest"
import { extractInstallSection, firstParagraph } from "./readme"

describe("firstParagraph", () => {
  it("skips headings, badges, and images to find the first real paragraph", () => {
    const readme = [
      "# My Plugin",
      "[![CI](https://example.com/badge.svg)](https://example.com)",
      '<img src="logo.png" />',
      "",
      "This plugin does a useful thing.",
      "It spans two lines.",
      "",
      "More text that shouldn't be included.",
    ].join("\n")
    expect(firstParagraph(readme)).toBe(
      "This plugin does a useful thing. It spans two lines."
    )
  })

  it("returns undefined for an empty README", () => {
    expect(firstParagraph("")).toBeUndefined()
  })
})

describe("extractInstallSection", () => {
  it("captures content under an Install heading up to the next sibling heading", () => {
    const readme = [
      "# My Plugin",
      "",
      "## Install",
      "",
      "```bash",
      "paseo plugin add someone/my-plugin",
      "```",
      "",
      "## Usage",
      "",
      "Open the command center.",
    ].join("\n")
    expect(extractInstallSection(readme)).toBe(
      "```bash\npaseo plugin add someone/my-plugin\n```"
    )
  })

  it("stops at a sibling heading but keeps deeper subheadings", () => {
    const readme = [
      "## Installation",
      "### Prerequisites",
      "Requires the CLI.",
      "### Plugin install",
      "```bash",
      "paseo plugin add owner/repo",
      "```",
      "## Usage",
      "Not included.",
    ].join("\n")
    const section = extractInstallSection(readme)
    expect(section).toContain("Prerequisites")
    expect(section).toContain("paseo plugin add owner/repo")
    expect(section).not.toContain("Not included")
  })

  it("does not treat an Uninstall heading as an Install section", () => {
    const readme = ["## Uninstalling", "Run `paseo plugin remove`."].join("\n")
    expect(extractInstallSection(readme)).toBeUndefined()
  })

  it("returns undefined when there is no matching heading", () => {
    const readme = [
      "## Overview",
      "Just a description, no setup section.",
    ].join("\n")
    expect(extractInstallSection(readme)).toBeUndefined()
  })
})
