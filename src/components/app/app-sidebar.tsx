"use client"

import {
  BooksIcon,
  CaretUpDownIcon,
  ChatsCircleIcon,
  CheckIcon,
  DesktopIcon,
  GearSixIcon,
  HashIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  MoonIcon,
  NotebookIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookCover } from "@/components/book-cover"
import { Logo } from "@/components/brand"
import { useCommandMenu } from "@/components/app/command-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import { books } from "@/lib/books"
import { bookFraction, pct } from "@/lib/progress"
import { channels } from "@/lib/seed"
import { useAppStore, useMe, useMyData } from "@/lib/store"

export const NAV = [
  { href: "/home", label: "Home", icon: HouseIcon },
  { href: "/library", label: "Library", icon: BooksIcon },
  { href: "/community", label: "Community", icon: ChatsCircleIcon },
  { href: "/notebook", label: "Notebook", icon: NotebookIcon },
] as const

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const data = useMyData()
  const book = books[0]
  const progress = pct(bookFraction(book, data.progress[book.id]))
  const openSearch = useCommandMenu((s) => s.setOpen)
  const { setOpenMobile } = useSidebar()
  const close = () => setOpenMobile(false)

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="gap-3 px-3 pt-3">
        <div className="flex h-8 items-center px-1 group-data-[collapsible=icon]:px-0">
          <Link href="/home" onClick={close} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
          </Link>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search ⌘K"
              onClick={() => {
                close()
                openSearch(true)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <MagnifyingGlassIcon />
              <span>Search</span>
              <Kbd className="ml-auto">⌘K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(pathname, item.href)} tooltip={item.label}>
                    <Link href={item.href} onClick={close}>
                      <item.icon weight={isActive(pathname, item.href) ? "fill" : "regular"} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Continue reading</SidebarGroupLabel>
          <SidebarGroupContent>
            <Link
              href={`/library/${book.slug}`}
              onClick={close}
              className="group/cr flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent"
            >
              <div className="w-9 shrink-0 transition-transform duration-300 group-hover/cr:-rotate-3">
                <BookCover book={book} detail="mark" className="rounded-[3px] shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{book.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={progress} className="h-1 flex-1" indicatorClassName="bg-brand" />
                  <span className="text-[11px] text-muted-foreground tabular-nums">{progress}%</span>
                </div>
              </div>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>

        {!pathname.startsWith("/community") && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channels.slice(0, 5).map((c) => {
                const href = `/community/${c.id}`
                const active = pathname === href || pathname === `${href}/`
                return (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton asChild size="sm" isActive={active} className="text-sidebar-foreground/80">
                      <Link href={href} onClick={close}>
                        {c.kind === "announcements" ? <MegaphoneIcon /> : <HashIcon />}
                        <span>{c.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserMenu() {
  const me = useMe()
  const router = useRouter()
  const logout = useAppStore((s) => s.logout)
  const { theme, setTheme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()
  if (!me) return null

  const nav = (href: string) => {
    setOpenMobile(false)
    router.push(href)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <UserAvatar user={me} className="size-8" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-medium">{me.displayName}</span>
                <span className="truncate text-xs text-muted-foreground">@{me.username}</span>
              </div>
              <CaretUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="w-60">
            <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-normal">
              <UserAvatar user={me} />
              <div className="grid leading-tight">
                <span className="text-sm font-medium text-foreground">{me.displayName}</span>
                <span className="text-xs text-muted-foreground">@{me.username}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => nav("/profile")}>
                <UserCircleIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => nav("/settings")}>
                <GearSixIcon />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunIcon className="dark:hidden" />
                  <MoonIcon className="hidden dark:block" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {[
                    { id: "light", label: "Light", icon: SunIcon },
                    { id: "dark", label: "Dark", icon: MoonIcon },
                    { id: "system", label: "System", icon: DesktopIcon },
                  ].map((t) => (
                    <DropdownMenuItem key={t.id} onSelect={() => setTheme(t.id)}>
                      <t.icon />
                      {t.label}
                      {theme === t.id && <CheckIcon className="ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout()
                router.push("/")
              }}
            >
              <SignOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
