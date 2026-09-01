import { useState } from "react"

/** Shared clipboard-copy behavior for CopyCommand and CopyBlock: copy, flash a "copied" state, then reset. */
export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false)

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), resetAfterMs)
  }

  return { copied, copy }
}
