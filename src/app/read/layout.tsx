import { AuthGuard } from "@/components/app/auth-guard"
import { CommandMenu } from "@/components/app/command-menu"
import { ThemeShortcut } from "@/components/theme-toggle"

export default function ReadLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
      <CommandMenu />
      <ThemeShortcut />
    </AuthGuard>
  )
}
