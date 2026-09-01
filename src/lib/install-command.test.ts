import { describe, expect, it } from "vitest"
import { getInstallCommand } from "./install-command"

describe("getInstallCommand", () => {
  it("includes --path for a subpath plugin", () => {
    expect(
      getInstallCommand({
        repo: "mcowger/paseo-plugins",
        path: "subagent-activity",
      })
    ).toBe("paseo plugin add mcowger/paseo-plugins --path subagent-activity")
  })

  it("omits --path for a single-plugin repo", () => {
    expect(getInstallCommand({ repo: "someone/their-plugin" })).toBe(
      "paseo plugin add someone/their-plugin"
    )
  })
})
