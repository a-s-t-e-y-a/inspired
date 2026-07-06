import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inspired Admin Panel",
  description: "Admin panel for managing doctors, hospitals, rooms, and medical conditions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontSize: "13px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
