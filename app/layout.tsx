import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jada Platform - Sistema de Cotação",
  description: "Plataforma de cotação onde compradores publicam necessidades e vendedores enviam propostas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}



