
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Fla10Logo } from "../fla10-logo";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LayoutDashboard, CalendarClock, Newspaper, PenSquare, Video, Menu, Home, Users, Trophy, MessageSquare, Palette } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/proximo-jogo", label: "Atualizar Próximo Jogo", icon: CalendarClock },
  { href: "/admin/materias", label: "Gerenciar Notícias", icon: Newspaper },
  { href: "/admin/colunas", label: "Gerenciar Colunas", icon: PenSquare },
  { href: "/admin/autores", label: "Gerenciar Autores", icon: Users },
  { href: "/admin/videos", label: "Gerenciar Vídeos", icon: Video },
  { href: "/admin/historia", label: "Gerenciar História", icon: Trophy },
  { href: "/admin/inscritos", label: "Gerenciar Inscritos", icon: Users },
  { href: "/admin/voz-torcedor", label: "Gerenciar A Voz do Torcedor", icon: MessageSquare },
  { href: "/admin/galeria", label: "Gerenciar Galeria", icon: Palette },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  // Match parent routes as well, e.g. /admin/materias/nova should highlight /admin/materias
  const isActive = (href === '/admin' && pathname === href) || (href !== '/admin' && pathname.startsWith(href));


  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700",
        isActive && "bg-gray-700 text-white"
      )}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

// This is the shared navigation structure for both mobile and desktop
function SidebarNavContent() {
    return (
        <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-white">
                    <Fla10Logo />
                    <span>FLA10 Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start gap-1 p-2 text-sm font-medium lg:p-4">
                     {navItems.map((item) => (
                        <NavLink key={item.href} {...item} />
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t border-gray-700 p-4">
                 <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700">
                    <Home className="h-4 w-4" />
                    Voltar ao Site
                </Link>
            </div>
        </div>
    );
}

export function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden bg-gray-800/40 text-white md:flex md:w-64 md:flex-col md:border-r md:border-gray-700">
        <SidebarNavContent />
      </aside>

      {/* Mobile Header with Sheet for Sidebar */}
      <header className="flex h-14 items-center gap-4 border-b bg-gray-800/40 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-gray-800 p-0 text-white border-r-gray-700">
              <SidebarNavContent />
            </SheetContent>
          </Sheet>
           <div className="flex-1 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 font-semibold text-white">
                    <Fla10Logo />
                    <span className="">FLA10 Admin</span>
                </Link>
           </div>
           <div className="w-8"></div> {/* Spacer to balance the menu button */}
        </header>
    </>
  );
}
