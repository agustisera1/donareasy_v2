import { Footer } from "@/components/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { sidebarProviderStyle } from "@/components/sidebar/sidebar-style";
import Header from "@/components/header";
import { RequireActiveAccount } from "@/components/require-active-account";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider open={true} style={sidebarProviderStyle}>
      <Suspense>
        <RequireActiveAccount />
      </Suspense>
      <AppSidebar />
      <SidebarInset className="items-center">
        <Header />
        <div className="flex w-full flex-1 flex-col items-center">
          <main className="w-full max-w-6xl p-6 space-y-6">{children}</main>
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
