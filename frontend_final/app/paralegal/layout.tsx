import { AppSidebar } from "@/components/app-sidebar"

export default function ParalegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar role="paralegal" alerts={4} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
