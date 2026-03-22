import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "MyStore 2026 | Premium E-commerce",
  description: "Best shopping experience built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <CartProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
