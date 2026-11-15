"use client"

import {
  BookOpenTextIcon,
  BooksIcon,
  ChatsCircleIcon,
  GearSixIcon,
  HashIcon,
  HouseIcon,
  MegaphoneIcon,
  MoonIcon,
  NotebookIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { create } from "zustand"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { books } from "@/lib/books"
import { channels } from "@/lib/seed"
import { useAppStore } from "@/lib/store"

export const useCommandMenu = create<{ open: boolean; setOpen: (o: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const logout = useAppStore((s) => s.logout)
  const book = books[0]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!useCommandMenu.getState().open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setOpen])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search Renewed" description="Jump to a page, chapter or channel">
      <Command>
        <CommandInput placeholder="Search chapters, channels, pages…" />
        <CommandList className="max-h-[min(420px,60vh)]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => go("/home")}><HouseIcon />Home</CommandItem>
            <CommandItem onSelect={() => go("/library")}><BooksIcon />Library</CommandItem>
            <CommandItem onSelect={() => go("/community")}><ChatsCircleIcon />Community</CommandItem>
            <CommandItem onSelect={() => go("/notebook")}><NotebookIcon />Notebook</CommandItem>
            <CommandItem onSelect={() => go("/profile")}><UserCircleIcon />Profile</CommandItem>
            <CommandItem onSelect={() => go("/settings")}><GearSixIcon />Settings</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={book.title}>
            {book.chapters.map((c) => (
              <CommandItem key={c.id} value={`${c.number} ${c.title}`} onSelect={() => go(`/read/${book.slug}/${c.id}`)}>
                <BookOpenTextIcon />
                <span className="w-5 text-muted-foreground tabular-nums">{c.number}</span>
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Channels">
            {channels.map((c) => (
              <CommandItem key={c.id} value={`channel ${c.name}`} onSelect={() => go(`/community/${c.id}`)}>
                {c.kind === "announcements" ? <MegaphoneIcon /> : <HashIcon />}
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
                setOpen(false)
              }}
            >
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
              <CommandShortcut>⇧D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false)
                logout()
                router.push("/")
              }}
            >
              <SignOutIcon />
              Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
