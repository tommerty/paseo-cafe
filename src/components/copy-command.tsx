import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center justify-between gap-3 border border-border bg-muted px-4 py-3">
      <code className="overflow-x-auto text-sm whitespace-pre">{command}</code>
      <Button
        variant="outline"
        size="icon-sm"
        className="shrink-0"
        onClick={handleCopy}
        aria-label="Copy install command"
      >
        {copied ? (
          <IconCheck className="size-3.5" />
        ) : (
          <IconCopy className="size-3.5" />
        )}
      </Button>
    </div>
  )
}
