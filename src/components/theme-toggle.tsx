"use client"

import { MoonIcon, SunIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

/** Global ⇧D shortcut. Mount once. */
export function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "d" && !isTyping(e)) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [resolvedTheme, setTheme])
  return null
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const next = resolvedTheme === "dark" ? "light" : "dark"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" className={className} onClick={() => setTheme(next)} aria-label="Toggle theme">
          <SunIcon className="hidden size-4 dark:block" />
          <MoonIcon className="size-4 dark:hidden" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Toggle theme <Kbd className="ml-1">⇧D</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
