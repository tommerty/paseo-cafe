import { describe, expect, it } from "vitest"
import { formatDate, formatDateTime } from "./format-date"

describe("formatDate", () => {
  it("formats a UTC date with zero-padded day and full month name", () => {
    expect(formatDate("2026-08-31T21:03:59Z")).toBe("31 Aug 2026")
  })

  it("zero-pads single-digit days", () => {
    expect(formatDate("2026-01-05T00:00:00Z")).toBe("05 Jan 2026")
  })
})

describe("formatDateTime", () => {
  it("appends a zero-padded UTC time", () => {
    expect(formatDateTime("2026-09-01T14:11:35Z")).toBe(
      "01 Sep 2026, 14:11 UTC"
    )
  })
})
