import { AuthButton } from "@/components/auth-button";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider open={true}>
      <AppSidebar mode="onboarding" />
      <main className="ml-[12rem] w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-end items-center p-3 px-5 text-sm">
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        {children}

        <Footer />
      </main>
    </SidebarProvider>
  );
}
