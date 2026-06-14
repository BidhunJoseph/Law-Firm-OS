export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Law Firm OS",
  description: "Next Generation Legal Operating System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userRole: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await db.profile.findUnique({
        where: { id: user.id },
        select: { role: true }
      });
      userRole = profile?.role || null;
    }
  } catch (error) {
    console.warn("Supabase Auth unreachable in RootLayout. Assuming unauthenticated or development fallback.");
  }

  // MOCK AUTH BYPASS
  if (!userRole && process.env.NODE_ENV === 'development') {
    const { cookies } = await import('next/headers');
    const mockCookie = (await cookies()).get('mock_user_role')?.value;
    if (mockCookie) userRole = mockCookie;
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-[#f8f9fa] text-gray-900 overflow-hidden">
        <AppShell userRole={userRole}>{children}</AppShell>
      </body>
    </html>
  );
}
