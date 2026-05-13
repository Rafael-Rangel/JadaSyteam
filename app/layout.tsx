import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JADA - Service & Support | Sistema de Cotação",
  description:
    "Plataforma de cotação onde compradores publicam necessidades e vendedores enviam propostas. Conecte compradores e vendedores de forma inteligente.",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased pb-[env(safe-area-inset-bottom,0px)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
