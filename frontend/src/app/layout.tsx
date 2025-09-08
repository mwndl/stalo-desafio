import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Stalo Challenge - Sistema de Gestão Financeira",
  description: "Sistema de gestão financeira pessoal e empresarial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" style={{ margin: '0 !important', padding: '0 !important', boxSizing: 'border-box !important' }}>
      <body style={{ margin: '0 !important', padding: '0 !important', border: '0 !important', boxSizing: 'border-box !important' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
