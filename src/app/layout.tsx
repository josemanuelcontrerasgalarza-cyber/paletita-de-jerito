import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paletita de Jerito — Tu negocio, sin límites",
  description: "Sistema de gestión para tu negocio de paletas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
