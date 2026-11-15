"use client"

import { ArrowCounterClockwiseIcon, CheckIcon, DesktopIcon, MoonIcon, SignOutIcon, SunIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Page, PageHeader } from "@/components/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserAvatar } from "@/components/user-avatar"
import { useAppStore, useMe, useMyData } from "@/lib/store"
import type { UserData } from "@/lib/types"
import { cn } from "@/lib/utils"

const AVATARS = [33, 12, 15, 51, 60, 5, 16, 20, 24, 45].map((n) => `https://i.pravatar.cc/240?img=${n}`)

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b py-8 last:border-b-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
      <div className="md:pt-2">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0 rounded-2xl bg-panel p-4 sm:p-5 [&_[data-slot=input-group]]:bg-background [&_[data-slot=input]]:bg-background [&_[data-slot=textarea]]:bg-background">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  return (
    <Page>
      <PageHeader title="Settings" description="Your profile, how Renewed looks, and how you read." />
      <div className="mt-4">
        <ProfileSection />
        <AppearanceSection />
        <ReadingSection />
        <NotificationsSection />
        <DataSection />
      </div>
    </Page>
  )
}

function ProfileSection() {
  const me = useMe()!
  const users = useAppStore((s) => s.users)
  const update = useAppStore((s) => s.updateProfile)
  const [form, setForm] = useState({ displayName: me.displayName, username: me.username, bio: me.bio, location: me.location ?? "", avatarUrl: me.avatarUrl })
  const dirty = form.displayName !== me.displayName || form.username !== me.username || form.bio !== me.bio || form.location !== (me.location ?? "") || form.avatarUrl !== me.avatarUrl
  const handle = form.username.trim().toLowerCase()
  const usernameError = !/^[a-z0-9._]{3,20}$/.test(handle) ? "3–20 characters: letters, numbers, dots, underscores." : users.some((u) => u.username === handle && u.id !== me.id) ? "That username is taken." : null

  return (
    <Section title="Profile" description="How you appear to others in the community.">
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel>Photo</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <UserAvatar user={{ ...me, avatarUrl: form.avatarUrl, displayName: form.displayName || me.displayName }} size="lg" className="mr-2 size-14" />
            {AVATARS.map((url) => (
              <button
                key={url}
                onClick={() => setForm((f) => ({ ...f, avatarUrl: url }))}
                className={cn("relative rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-105", form.avatarUrl === url && "ring-2 ring-foreground")}
                aria-label="Choose photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-8 rounded-full object-cover" />
              </button>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setForm((f) => ({ ...f, avatarUrl: undefined }))}
                  className={cn("rounded-full ring-offset-2 ring-offset-background", !form.avatarUrl && "ring-2 ring-foreground")}
                  aria-label="Use initials"
                >
                  <UserAvatar user={{ ...me, avatarUrl: undefined }} className="size-8" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Use initials</TooltipContent>
            </Tooltip>
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
            <Input id="displayName" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
          </Field>
          <Field data-invalid={!!usernameError}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <InputGroup>
              <InputGroupAddon>@</InputGroupAddon>
              <InputGroupInput id="username" value={form.username} aria-invalid={!!usernameError} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </InputGroup>
            {usernameError && <FieldDescription className="text-destructive">{usernameError}</FieldDescription>}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea id="bio" maxLength={160} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="min-h-20" />
          <FieldDescription className="text-right tabular-nums">{form.bio.length}/160</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input id="location" value={form.location} placeholder="City, State" onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" disabled={!dirty} onClick={() => setForm({ displayName: me.displayName, username: me.username, bio: me.bio, location: me.location ?? "", avatarUrl: me.avatarUrl })}>
            Cancel
          </Button>
          <Button
            disabled={!dirty || !!usernameError || !form.displayName.trim()}
            onClick={() => {
              update({ ...form, username: handle, displayName: form.displayName.trim(), location: form.location.trim() || undefined })
              toast.success("Profile updated")
            }}
          >
            Save changes
          </Button>
        </div>
      </FieldGroup>
    </Section>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const options = [
    { id: "light", label: "Light", icon: SunIcon },
    { id: "dark", label: "Dark", icon: MoonIcon },
    { id: "system", label: "System", icon: DesktopIcon },
  ]
  return (
    <Section title="Appearance" description="Choose how Renewed looks. System follows your device.">
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => {
          const active = theme === o.id
          return (
            <button key={o.id} onClick={() => setTheme(o.id)} className="group text-left" aria-pressed={active}>
              <div className={cn("relative overflow-hidden rounded-xl border-2 bg-background transition-colors", active ? "border-foreground" : "border-transparent group-hover:border-muted-foreground/30")}>
                <ThemePreview mode={o.id as "light" | "dark" | "system"} />
                {active && (
                  <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                    <CheckIcon weight="bold" className="size-3" />
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <o.icon className="size-4 text-muted-foreground" /> {o.label}
              </div>
            </button>
          )
        })}
      </div>
    </Section>
  )
}

function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
  const pane = (dark: boolean) => (
    <div className={cn("flex h-full gap-1.5 p-2", dark ? "bg-[#1a1a19]" : "bg-white")}>
      <div className={cn("w-1/4 space-y-1 rounded-md p-1", dark ? "bg-[#232322]" : "bg-[#f7f7f5]")}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("h-1.5 rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
        ))}
      </div>
      <div className="flex-1 space-y-1.5 pt-1">
        <div className={cn("h-2 w-2/3 rounded-full", dark ? "bg-white/40" : "bg-black/50")} />
        <div className={cn("h-1.5 w-full rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
        <div className={cn("h-1.5 w-5/6 rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
        <div className="h-1.5 w-1/3 rounded-full bg-[#d9a54e]" />
      </div>
    </div>
  )
  return (
    <div className="aspect-[16/10]">
      {mode === "system" ? (
        <div className="relative h-full">
          <div className="absolute inset-0">{pane(false)}</div>
          <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">{pane(true)}</div>
        </div>
      ) : (
        pane(mode === "dark")
      )}
    </div>
  )
}

function ReadingSection() {
  const prefs = useMyData().readerPrefs
  const set = useAppStore((s) => s.setReaderPrefs)
  return (
    <Section title="Reading" description="Defaults for the reader. You can also change these from inside a chapter.">
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel>Typeface</FieldLabel>
            <ToggleGroup type="single" variant="outline" className="w-full" value={prefs.font} onValueChange={(v) => v && set({ font: v as typeof prefs.font })}>
              <ToggleGroupItem value="sans" className="flex-1 font-sans">DM Sans</ToggleGroupItem>
              <ToggleGroupItem value="serif" className="flex-1 font-serif">Newsreader</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <div className="flex justify-between">
              <FieldLabel>Text size</FieldLabel>
              <span className="text-sm text-muted-foreground tabular-nums">{prefs.fontSize}px</span>
            </div>
            <Slider min={15} max={26} step={1} value={[prefs.fontSize]} onValueChange={([v]) => set({ fontSize: v })} className="py-2" />
          </Field>
        </div>
        <div className={cn("rounded-xl bg-background p-5", prefs.font === "serif" ? "font-serif" : "font-sans")} style={{ fontSize: prefs.fontSize, lineHeight: 1.7 }}>
          “Why did you make it so big?” I heard a voice… “To show you how big I am.”
        </div>
      </div>
    </Section>
  )
}

function NotificationsSection() {
  const n = useMyData().notifications
  const set = useAppStore((s) => s.setNotification)
  const rows: { key: keyof UserData["notifications"]; label: string; description: string }[] = [
    { key: "replies", label: "Replies and likes", description: "When someone replies to or likes your posts." },
    { key: "announcements", label: "Announcements", description: "Updates and live events from Bucky and the team." },
    { key: "newBooks", label: "New releases", description: "When the next book in the series unlocks." },
    { key: "weeklyDigest", label: "Weekly digest", description: "A Sunday summary of your reading and the community." },
  ]
  return (
    <Section title="Notifications" description="Choose what you hear about.">
      <div className="-my-2 divide-y divide-background">
        {rows.map((r) => (
          <label key={r.key} htmlFor={`n-${r.key}`} className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
            <div>
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-[13px] text-muted-foreground">{r.description}</div>
            </div>
            <Switch id={`n-${r.key}`} checked={n[r.key]} onCheckedChange={(v) => set(r.key, v)} />
          </label>
        ))}
      </div>
    </Section>
  )
}

function DataSection() {
  const reset = useAppStore((s) => s.resetDemo)
  const logout = useAppStore((s) => s.logout)
  const router = useRouter()
  return (
    <Section title="Account" description="This is a demo. Everything is stored in your browser.">
      <div className="flex flex-wrap gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <ArrowCounterClockwiseIcon /> Reset demo data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the demo?</AlertDialogTitle>
              <AlertDialogDescription>
                Progress, highlights, reflections, posts and any accounts you created will go back to the original demo state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  reset()
                  toast.success("Demo data reset")
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="ghost"
          onClick={() => {
            logout()
            router.push("/")
          }}
        >
          <SignOutIcon /> Sign out
        </Button>
      </div>
    </Section>
  )
}
