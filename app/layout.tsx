import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Donareasy - Doná fácil",
    template: "%s | Donareasy",
  },
  description: "Plataforma fácil y segura para colaborar con quienes lo necesitan, en el momento oportuno. Conectá con instituciones y donantes para colaborar en proyectos sociales.",
  keywords: ["donaciones", "ayuda social", "campañas", "instituciones", "donantes", "solidaridad"],
  authors: [{ name: "Agustín Tisera" }],
  creator: "Agustín Tisera",
  publisher: "Agustín Tisera",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-ES"
      className={cn("dark font-sans", outfit.variable)}
    >
      <body className="antialiased">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
