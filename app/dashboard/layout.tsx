import { Footer } from "@/components/footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider open={true}>
      <AppSidebar />
      <main className="ml-[12rem] w-full flex flex-col items-center">
        <Header />
        {children}
        <Footer />
      </main>
    </SidebarProvider>
  );
}
