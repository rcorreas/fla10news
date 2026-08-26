
"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Menu, Newspaper, Users, Video, Trophy, Shield, ChevronDown, LayoutGrid, ScanLine, Palette } from 'lucide-react'
import { Fla10Logo } from '@/components/fla10-logo'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AuthButton } from '../auth-button'

const navLinks = [
  { href: '/noticias', label: 'Notícias', icon: Newspaper },
  { href: '/colunas', label: 'Colunas', icon: Users },
  { href: '/videos', label: 'Vídeos', icon: Video },
  { href: '/raio-x', label: 'Raio-X', icon: ScanLine },
  { href: '/galeria', label: 'Galeria', icon: Palette },
]

const clubeLinks = [
  { href: "/historia", label: "História" },
  { href: "/titulos", label: "Títulos" },
  { href: "/estadio", label: "Estádio" },
  { href: "/ct", label: "CT" },
  { href: "/socio-torcedor", label: "Sócio-Torcedor" },
];

const categoryLinks = [
  { href: "/futebol", label: "Futebol" },
  { href: "/basquete", label: "Basquete" },
  { href: "/volei", label: "Vôlei" },
  { href: "/e-sports", label: "E-Sports" },
  { href: "/olimpicos", label: "Olímpicos" },
];

export function Header() {
  const pathname = usePathname()

  const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors",
        pathname.startsWith(href)
          ? "text-primary-foreground"
          : "text-primary-foreground/70 hover:text-primary-foreground"
      )}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )

  const NavDropdown = ({ label, icon: Icon, links }: { label: string, icon: React.ElementType, links: {href: string, label: string}[] }) => {
    const isActive = links.some(link => pathname.startsWith(link.href) && link.href !== '#');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "group flex items-center gap-2 text-sm font-medium transition-colors outline-none",
                    isActive ? "text-primary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
                )}
            >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                <ChevronDown className="h-4 w-4 relative top-[1px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur border-white/20 text-primary-foreground">
                {links.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                        <Link href={link.href} className="cursor-pointer">{link.label}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Fla10Logo />
            <span className="font-bold text-primary-foreground">
              <span className="font-exo">FLA10</span><span className="font-headline"> News</span>
            </span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map(link => <NavLink key={link.href} {...link} />)}
            <NavDropdown label="Categorias" icon={LayoutGrid} links={categoryLinks} />
            <NavDropdown label="Clube" icon={Shield} links={clubeLinks} />
          </nav>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex">
              <AuthButton />
            </div>
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                  <div className="flex h-16 items-center border-b px-6">
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center gap-2 font-semibold">
                          <Fla10Logo />
                          <span className="font-bold">
                              <span className="font-exo">FLA10</span><span className="font-headline"> News</span>
                          </span>
                      </Link>
                    </SheetClose>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                      <nav className="grid gap-2 p-4">
                          <SheetClose asChild>
                            <Link
                                href="/"
                                className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === '/' ? 'bg-muted text-primary' : 'text-muted-foreground'
                                )}>
                                <ArrowLeft className="h-4 w-4" />
                                Início
                            </Link>
                          </SheetClose>
                          {navLinks.map(link => (
                            <SheetClose asChild key={link.href}>
                              <Link
                                  href={link.href}
                                  className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                  pathname.startsWith(link.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                                  )}>
                                  <link.icon className="h-4 w-4" />
                                  {link.label}
                              </Link>
                            </SheetClose>
                          ))}
                           <div className="mt-2">
                            <h4 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Categorias</h4>
                            {categoryLinks.map(link => (
                                <SheetClose asChild key={link.label}>
                                    <Link href={link.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                        {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                          </div>
                          <div className="mt-2">
                            <h4 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Clube</h4>
                            {clubeLinks.map(link => (
                                <SheetClose asChild key={link.label}>
                                    <Link href={link.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                        {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                          </div>
                      </nav>
                  </div>
                  <div className="border-t p-4">
                    <AuthButton />
                  </div>
                </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
