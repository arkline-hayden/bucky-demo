"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useAppStore } from "@/lib/store"

const subscribe = (cb: () => void) => useAppStore.persist.onFinishHydration(cb)
const getSnapshot = () => useAppStore.persist.hasHydrated()
const getServerSnapshot = () => false

/** True once the persisted demo database has been loaded from localStorage. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function StoreHydrator() {
  useEffect(() => {
    if (!useAppStore.persist.hasHydrated()) void useAppStore.persist.rehydrate()
  }, [])
  return null
}
