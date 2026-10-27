import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taller El Rayo | Mecánica Automotriz de Confianza en Delicias, Chihuahua",
  description:
    "Taller mecánico El Rayo: cambios de aceite, frenos, alineación, diagnóstico computarizado, suspensión y más. Agenda tu cita en línea y ahorra tiempo.",
  keywords: [
    "taller mecánico",
    "Delicias Chihuahua",
    "cambio de aceite",
    "frenos",
    "alineación",
    "diagnóstico computarizado",
    "mecánico automotriz",
  ],
  authors: [{ name: "Taller El Rayo" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Taller El Rayo | Mecánica Automotriz",
    description: "Agenda tu cita en línea. Servicio profesional y rápido.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${oswald.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
