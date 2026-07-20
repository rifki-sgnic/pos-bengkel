import {
  BarChart3,
  ChevronUp,
  Folder,
  Laptop,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Receipt,
  ShoppingCart,
  Sun,
  Wrench,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuthStore } from "@/features/auth/useAuthStore"
import { useTheme } from "@/components/theme-provider"

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, ownerOnly: false },
  { title: "Kasir (POS)", url: "/pos", icon: ShoppingCart, ownerOnly: false },
  { title: "Produk & Jasa", url: "/products", icon: Package, ownerOnly: false },
  { title: "Kategori", url: "/categories", icon: Folder, ownerOnly: true },
  {
    title: "Riwayat Transaksi",
    url: "/transactions",
    icon: Receipt,
    ownerOnly: false,
  },
  { title: "Laporan", url: "/reports", icon: BarChart3, ownerOnly: true },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AppSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const isOwner = user?.role === "OWNER"

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const visibleItems = navItems.filter((item) => !item.ownerOnly || isOwner)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Wrench className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">Bengkel POS</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Sistem Kasir
                    </span>
                  </div>
                </div>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : ""
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    render={
                      <div>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user ? getInitials(user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                          <span className="text-sm leading-none font-medium">
                            {user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.role === "OWNER" ? "Owner" : "Kasir"}
                          </span>
                        </div>
                        <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                      </div>
                    }
                  />
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === "dark" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : theme === "light" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Laptop className="mr-2 h-4 w-4" />
                    )}
                    <span>Ubah Tema</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Terang (Light)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Gelap (Dark)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>Sistem</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
