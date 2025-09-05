import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationMenu from "@/components/navigation-menu";
import GlobalAlertDialog from "@/components/global-alert-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionSettingsProvider } from "@/contexts/session-settings-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Up Plan",
  description: "blah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex items-center gap-4 px-4 ">
            <h1 className="text-2xl font-bold whitespace-nowrap">
              <Link href="/">Up Plan</Link>
            </h1>
            <NavigationMenu />
          </div>
          <SessionSettingsProvider>{children}</SessionSettingsProvider>
          <GlobalAlertDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
