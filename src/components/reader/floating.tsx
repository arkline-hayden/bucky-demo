"use client"

import { motion } from "motion/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * A small floating card pinned to a viewport rect (a text selection or a
 * highlight). Re-measures on scroll/resize. On phones it docks to the bottom.
 */
export function Floating({
  getRect,
  onDismiss,
  children,
  className,
  placement = "top",
  dockOnMobile = false,
}: {
  getRect: () => DOMRect | null
  onDismiss: () => void
  children: React.ReactNode
  className?: string
  placement?: "top" | "bottom"
  dockOnMobile?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const docked = dockOnMobile && isMobile
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null)

  useLayoutEffect(() => {
    if (docked) return
    let raf = 0
    const measure = () => {
      const rect = getRect()
      const el = ref.current
      if (!rect || !el) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      const gap = 10
      let below = placement === "bottom" || rect.top - h - gap < 64
      if (below && rect.bottom + h + gap > window.innerHeight - 8 && rect.top - h - gap > 64) below = false
      const top = below ? rect.bottom + gap : rect.top - h - gap
      const left = Math.min(Math.max(8, rect.left + rect.width / 2 - w / 2), window.innerWidth - w - 8)
      setPos({ top, left, below })
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [getRect, placement, docked])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss()
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (ref.current?.contains(t)) return
      if (t.closest("[data-floating-keep]")) return
      onDismiss()
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [onDismiss])

  return (
    <motion.div
      ref={ref}
      role="dialog"
      initial={{ opacity: 0, y: docked ? 24 : pos?.below ? -4 : 4, scale: docked ? 1 : 0.97 }}
      animate={{ opacity: pos || docked ? 1 : 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: docked ? 1 : 0.97, y: docked ? 24 : 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      style={docked ? undefined : { top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
      className={cn(
        "fixed z-50 rounded-xl border bg-popover text-popover-foreground shadow-[0_10px_38px_-10px_rgb(0_0_0/0.35),0_10px_20px_-15px_rgb(0_0_0/0.2)]",
        docked && "inset-x-2 bottom-[calc(8px+env(safe-area-inset-bottom))] rounded-2xl",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
