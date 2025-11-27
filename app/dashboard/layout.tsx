'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/ui/Loading';
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: User,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'My Orders',
      href: '/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Addresses',
      href: '/dashboard/addresses',
      icon: MapPin,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-6 border-b border-[#D4A574]">
            <h2 className="text-xl font-bold text-[#2C1810]">My Account</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#8B6F47] hover:text-[#2C1810]"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-[#C1502E]/10 text-[#C1502E] border-r-2 border-[#C1502E]'
                      : 'text-[#8B6F47] hover:bg-[#FAF6F1] hover:text-[#2C1810]'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 text-sm font-medium text-[#8B6F47] hover:bg-[#FAF6F1] hover:text-[#2C1810] transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </nav>

          {/* User info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#D4A574] bg-[#FAF6F1]">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#C1502E] flex items-center justify-center">
                <span className="text-white font-semibold">
                  {/* {user.name.charAt(0).toUpperCase()} */}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#2C1810]">{user.name}</p>
                <p className="text-xs text-[#8B6F47]">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-0">
          {/* Mobile header */}
          <div className="sticky top-0 z-10 lg:hidden bg-white border-b border-[#D4A574] px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#8B6F47] hover:text-[#2C1810]"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}