import { AppHeader } from "@/components/app/app-header"
import { AppSidebar } from "@/components/app/app-sidebar"
import { AuthGuard } from "@/components/app/auth-guard"
import { CommandMenu } from "@/components/app/command-menu"
import { MobileNav } from "@/components/app/mobile-nav"
import { ThemeShortcut } from "@/components/theme-toggle"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <div className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        </SidebarInset>
        <MobileNav />
        <CommandMenu />
        <ThemeShortcut />
      </SidebarProvider>
    </AuthGuard>
  )
}
