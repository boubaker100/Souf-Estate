import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { SiteHeader } from "./components/site-header"
import { Suspense } from "react"
import { Skeleton } from "../ui/skeleton"

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        
              {/* هنا سيتم عرض children */}
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <Outlet />
              </Suspense>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}