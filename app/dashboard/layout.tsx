import { Footer } from "@/components/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { sidebarProviderStyle } from "@/components/sidebar/sidebar-style";
import Header from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider open={true} style={sidebarProviderStyle}>
      <AppSidebar />
      <SidebarInset className="items-center">
        <Header />
        {children}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
