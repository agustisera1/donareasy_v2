import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

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

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ES" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster theme="dark" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
