import { cn } from "@/lib/utils"

/** The page frame every app screen shares: one centred 1100px column. */
export function Page({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 pt-7 pb-16 sm:px-6 md:pt-12 xl:px-0", narrow ? "max-w-[880px]" : "max-w-[1100px]", className)}>{children}</div>
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-medium tracking-[-0.025em] sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
