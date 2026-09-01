import { describe, expect, it } from "vitest"
import { registryEntrySchema } from "./registry-schema"

describe("registryEntrySchema", () => {
  it("accepts a minimal valid entry", () => {
    const result = registryEntrySchema.safeParse({
      id: "subagent-activity",
      repo: "mcowger/paseo-plugins",
      path: "subagent-activity",
    })
    expect(result.success).toBe(true)
  })

  it("defaults categories to an empty array", () => {
    const result = registryEntrySchema.parse({
      id: "skills",
      repo: "gpambrozio/paseo-plugins",
    })
    expect(result.categories).toEqual([])
  })

  it.each([
    { id: "Subagent-Activity" }, // uppercase
    { id: "sub_agent" }, // underscore
    { id: "-subagent" }, // leading hyphen
  ])("rejects a malformed id %o", (overrides) => {
    const result = registryEntrySchema.safeParse({
      repo: "owner/repo",
      ...overrides,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a repo that isn't 'owner/repo'", () => {
    const result = registryEntrySchema.safeParse({
      id: "plugin",
      repo: "https://github.com/owner/repo",
    })
    expect(result.success).toBe(false)
  })

  it("rejects unknown fields", () => {
    const result = registryEntrySchema.safeParse({
      id: "plugin",
      repo: "owner/repo",
      description: "not allowed here — that's derived, not submitted",
    })
    expect(result.success).toBe(false)
  })
})
