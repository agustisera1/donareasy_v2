import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
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

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-serif",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ES" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} ${lora.variable} font-sans antialiased`}>
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
