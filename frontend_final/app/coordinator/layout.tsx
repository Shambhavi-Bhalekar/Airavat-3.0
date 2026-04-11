import { AppSidebar } from "@/components/app-sidebar"

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar role="coordinator" alerts={2} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
