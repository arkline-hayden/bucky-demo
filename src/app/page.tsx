"use client"

import { ArrowRightIcon, AtIcon, EyeIcon, EyeSlashIcon, LockSimpleIcon, SpinnerGapIcon, UserIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BookCover } from "@/components/book-cover"
import { Logo } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { books } from "@/lib/books"
import { useHydrated } from "@/lib/hydration"
import { DEMO_PASSWORD, DEMO_USERNAME } from "@/lib/seed"
import { useAppStore } from "@/lib/store"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function SignInPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const sessionUserId = useAppStore((s) => s.sessionUserId)
  const login = useAppStore((s) => s.login)
  const signup = useAppStore((s) => s.signup)

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (hydrated && sessionUserId && !pending) router.replace("/home")
  }, [hydrated, sessionUserId, pending, router])

  async function submit(u = username, p = password) {
    setError(null)
    setPending(true)
    await wait(650) // feels like a real round trip
    const res = mode === "signin" ? login(u, p) : signup({ displayName, username: u, password: p })
    if (!res.ok) {
      setError(res.error)
      setPending(false)
      return
    }
    if (mode === "signup") toast.success("Welcome to Renewed", { description: "Your account is ready. Start with Book 1." })
    router.push("/home")
  }

  function useDemo() {
    setMode("signin")
    setUsername(DEMO_USERNAME)
    setPassword(DEMO_PASSWORD)
    void submit(DEMO_USERNAME, DEMO_PASSWORD)
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Form side ─────────────────────────────── */}
      <div className="relative flex flex-col px-5 py-5 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-8 flex gap-3 lg:hidden">
              {books.slice(0, 3).map((b, i) => (
                <div key={b.id} className="w-14" style={{ transform: `rotate(${(i - 1) * 4}deg)` }}>
                  <BookCover book={b} detail="mark" />
                </div>
              ))}
            </div>
            <h1 className="text-[28px] leading-tight font-medium tracking-[-0.025em]">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">
              {mode === "signin" ? "Pick up right where you left off." : "Join the community reading the Renewed series."}
            </p>

            <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); setError(null) }} className="mt-7">
              <TabsList className="w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
            </Tabs>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault()
                void submit()
              }}
            >
              <FieldGroup className="gap-4">
                <AnimatePresence initial={false}>
                  {mode === "signup" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <Field>
                        <FieldLabel htmlFor="name">Display name</FieldLabel>
                        <InputGroup className="h-10">
                          <InputGroupAddon><UserIcon /></InputGroupAddon>
                          <InputGroupInput id="name" placeholder="Jordan Avery" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
                        </InputGroup>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <InputGroup className="h-10">
                    <InputGroupAddon><AtIcon /></InputGroupAddon>
                    <InputGroupInput
                      id="username"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      aria-invalid={!!error}
                    />
                  </InputGroup>
                </Field>
                <Field data-invalid={!!error}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {mode === "signin" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                            Forgot password?
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Password reset is disabled in the demo</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <InputGroup className="h-10">
                    <InputGroupAddon><LockSimpleIcon /></InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      aria-invalid={!!error}
                    />
                    <InputGroupAddon align="inline-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InputGroupButton size="icon-xs" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                          </InputGroupButton>
                        </TooltipTrigger>
                        <TooltipContent>{showPassword ? "Hide password" : "Show password"}</TooltipContent>
                      </Tooltip>
                    </InputGroupAddon>
                  </InputGroup>
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <FieldError>{error}</FieldError>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>
                <Button type="submit" size="lg" className="mt-1 h-10 w-full" disabled={pending || !hydrated}>
                  {pending ? <SpinnerGapIcon className="animate-spin" /> : null}
                  {mode === "signin" ? (pending ? "Signing in" : "Sign in") : pending ? "Creating account" : "Create account"}
                </Button>
              </FieldGroup>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 rounded-2xl bg-panel p-4">
              <div>
                <div>
                  <div className="text-sm font-medium">Try the demo account</div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    Halfway through Book 1, with notes, reflections and community activity.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted-foreground">
                    <span>Username <Kbd className="font-sans">{DEMO_USERNAME}</Kbd></span>
                    <span>Password <Kbd className="font-sans">{DEMO_PASSWORD}</Kbd></span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-3.5 h-9 w-full" onClick={useDemo} disabled={pending || !hydrated}>
                Continue as Jordan
                <ArrowRightIcon />
              </Button>
            </div>
          </motion.div>
        </main>

        <footer className="text-xs text-muted-foreground">© 2026 Equipping to Flourish Ministry</footer>
      </div>

      {/* ── Art side ─────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-[#111d31] text-[#efe6d3] lg:flex lg:flex-col">
                <Stars />
        <div className="relative flex flex-1 items-center justify-center px-12">
          <div className="relative h-[380px] w-[440px]">
            {[books[1], books[2], books[0]].map((b, i) => {
              const pos = [
                { x: -128, r: -10, y: 26, s: 0.86 },
                { x: 128, r: 10, y: 26, s: 0.86 },
                { x: 0, r: 0, y: 0, s: 1 },
              ][i]
              return (
                <motion.div
                  key={b.id}
                  className="absolute top-0 left-1/2 w-[220px]"
                  style={{ marginLeft: -110, zIndex: i === 2 ? 2 : 1 }}
                  initial={{ opacity: 0, y: 40, rotate: 0, x: 0 }}
                  animate={{ opacity: 1, y: pos.y, rotate: pos.r, x: pos.x, scale: pos.s }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BookCover book={b} className={i === 2 ? "" : "opacity-80"} />
                </motion.div>
              )
            })}
          </div>
        </div>
        <motion.figure
          className="relative px-14 pb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <blockquote className="max-w-md font-serif text-[26px] leading-snug tracking-[-0.01em] text-balance">
            “Why did you make it so big?”
            <br />
            <span className="text-[#e2b864]">“To show you how big I am.”</span>
          </blockquote>
          <figcaption className="mt-4 text-sm text-[#efe6d3]/60">The Highest Power · Introduction</figcaption>
        </motion.figure>
      </aside>
    </div>
  )
}

function Stars() {
  const stars = Array.from({ length: 46 }, (_, i) => {
    const x = (i * 73.13) % 100
    const y = (i * 41.7) % 62
    const r = ((i * 7) % 3) * 0.35 + 0.5
    return { x, y, r, d: (i % 7) * 0.6 }
  })
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#f4ead7"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: s.d }}
        />
      ))}
    </svg>
  )
}
