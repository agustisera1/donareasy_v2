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
          {children}
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
