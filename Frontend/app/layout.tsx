import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { getCurrentUser } from "@/lib/auth"
import "./globals.css"

export const metadata: Metadata = {
  title: "OCR Invoice Service",
  description: "Service de reconnaissance automatique de factures",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Navbar user={user} />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
