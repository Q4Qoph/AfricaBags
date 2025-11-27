"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace(!user ? "/login" : "/dashboard");
    }
  }, [user, loading, isAdmin, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href) && pathname !== "/admin";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Centered Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Header */}
        <header className="hidden lg:block mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-xl text-gray-600">Manage your business with ease</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar — FIXED: NO MORE 1px BLEED ON MOBILE */}
          <aside className="lg:col-span-1">
            <div
              className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white rounded-r-2xl shadow-2xl overflow-hidden
                transition-all duration-300 ease-out
                ${sidebarOpen 
                  ? "translate-x-0 visible" 
                  : "-translate-x-full invisible"
                }
                lg:visible lg:translate-x-0 lg:static lg:inset-auto lg:rounded-2xl lg:shadow-xl
              `}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#8B4513] rounded-xl flex items-center justify-center shadow-md">
                      <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group ${
                          active
                            ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20"
                            : "text-gray-700 hover:bg-gray-100 hover:text-[#8B4513]"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            active ? "text-white" : "text-gray-500 group-hover:text-[#8B4513]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="mx-4" />

                {/* User + Logout */}
                <div className="p-5 space-y-4 bg-gray-50/50">
                  <div className="flex items-center space-x-3 px-2">
                    <Avatar className="h-12 w-12 ring-4 ring-white shadow-lg">
                      <AvatarFallback className="bg-[#8B4513] text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name || "Admin"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white rounded-2xl shadow-md p-5 mb-6 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <h2 className="text-xl font-bold text-[#8B4513]">Admin Dashboard</h2>
              <div className="w-10" />
            </header>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-6 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}