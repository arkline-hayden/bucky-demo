"use client"

import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LogoMark } from "@/components/brand"
import { useHydrated } from "@/lib/hydration"
import { DEMO_PASSWORD, DEMO_USERNAME } from "@/lib/seed"
import { useAppStore } from "@/lib/store"

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <LogoMark className="size-10 rounded-xl" />
      </motion.div>
    </div>
  )
}

/** Client-side session gate: the "server" here is the browser's demo database. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const signedIn = useAppStore((s) => !!s.sessionUserId && s.users.some((u) => u.id === s.sessionUserId))
  const router = useRouter()

  useEffect(() => {
    if (!hydrated || signedIn) return
    // Shareable demo links: any app URL with ?demo=1 signs in as the demo reader.
    if (new URLSearchParams(window.location.search).has("demo")) {
      useAppStore.getState().login(DEMO_USERNAME, DEMO_PASSWORD)
      return
    }
    router.replace("/")
  }, [hydrated, signedIn, router])

  if (!hydrated || !signedIn) return <Splash />
  return <>{children}</>
}
