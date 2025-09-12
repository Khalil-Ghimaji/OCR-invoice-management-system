"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, FileText, Upload, BarChart3, Settings, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@prisma/client"

interface NavbarProps {
  user?: User | null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Factures", href: "/invoices", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Abonnements", href: "/subscriptions", icon: Settings },
]

const adminNavigation = [
  { name: "Admin", href: "/admin", icon: Settings },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Factures Admin", href: "/admin/invoices", icon: FileText },
  { name: "Logs", href: "/admin/audit", icon: BarChart3 },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  // Don't show navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href={user ? "/dashboard" : "/"} className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">OCR Invoice</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Admin Navigation */}
            {user.role === "ADMIN" && (
              <>
                <div className="h-4 w-px bg-border" />
                {adminNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                        pathname.startsWith(item.href) ? "text-foreground" : "text-foreground/60",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        )}

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="md:hidden">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span className="font-bold">OCR Invoice</span>
              </Link>
            </div>
          </div>

          {user ? (
            <div className="flex items-center space-x-2">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="md:hidden" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                  <MobileNav user={user} />
                </SheetContent>
              </Sheet>

              <UserNav user={user} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">S'inscrire</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MobileNav({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col space-y-3">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <FileText className="h-6 w-6" />
        <span className="font-bold">OCR Invoice</span>
      </Link>

      <div className="flex flex-col space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent",
                pathname === item.href ? "bg-accent" : "transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        {user.role === "ADMIN" && (
          <>
            <div className="my-2 h-px bg-border" />
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Administration</div>
            {adminNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname.startsWith(item.href) ? "bg-accent" : "transparent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
