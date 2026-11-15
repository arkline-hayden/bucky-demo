import { FeatherIcon, SealCheckIcon, ShieldCheckIcon } from "@phosphor-icons/react"
import { LogoMark } from "@/components/brand"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Role, User } from "@/lib/types"
import { cn } from "@/lib/utils"

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const SIZE = { sm: "size-6", default: "size-8", lg: "size-10" }

export function UserAvatar({ user, className, size = "default" }: { user?: User; className?: string; size?: "sm" | "default" | "lg" }) {
  if (user?.role === "admin") return <LogoMark className={cn(SIZE[size], "rounded-full", className)} />
  return (
    <Avatar size={size} className={className}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback className="text-[0.8em] font-medium text-white" style={{ background: user?.avatarColor ?? "#6b7280" }}>
        {initials(user?.displayName ?? "?")}
      </AvatarFallback>
    </Avatar>
  )
}

const ROLE_META: Record<Exclude<Role, "member">, { label: string; icon: typeof SealCheckIcon; className: string }> = {
  author: { label: "Author", icon: FeatherIcon, className: "bg-secondary text-secondary-foreground" },
  admin: { label: "Team", icon: SealCheckIcon, className: "bg-secondary text-secondary-foreground" },
  moderator: { label: "Mod", icon: ShieldCheckIcon, className: "bg-secondary text-secondary-foreground" },
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  if (role === "member") return null
  const meta = ROLE_META[role]
  const Icon = meta.icon
  return (
    <Badge variant="outline" className={cn("h-[18px] shrink-0 gap-1 rounded-[5px] border-transparent px-1.5 text-[11px] font-medium", meta.className, className)}>
      <Icon weight="fill" className="size-2.5!" />
      {meta.label}
    </Badge>
  )
}
