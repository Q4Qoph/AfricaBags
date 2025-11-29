"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  User,
  MapPin,
  Heart,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const quickLinks = [
  {
    title: "My Profile",
    desc: "Update your account",
    href: "/dashboard/profile",
    icon: User,
    color: "text-blue-600",
  },
  {
    title: "My Orders",
    desc: "View order history",
    href: "/orders",
    icon: ShoppingBag,
    color: "text-green-600",
  },
  {
    title: "Addresses",
    desc: "Manage shipping",
    href: "/dashboard/addresses",
    icon: MapPin,
    color: "text-purple-600",
  },
  {
    title: "Wishlist",
    desc: "Your saved items",
    href: "/wishlist",
    icon: Heart,
    color: "text-red-600",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: response, isLoading, error } = useOrders.my();

  // Correctly extract the array from your real API shape: { orders: [...] }
  const orders = response?.orders || [];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) =>
    ["pending", "confirmed"].includes(o.status)
  ).length;
  const totalSpent = orders.reduce(
    (sum: number, o: any) => Number(sum) + Number(o.subtotal),
    0
  );
  const recentOrders = orders.slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(Number(amount));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      placed: "bg-blue-50 text-blue-700",
      confirmed: "bg-yellow-50 text-yellow-700",
      shipped: "bg-purple-50 text-purple-700",
      delivered: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-700",
    };
    return styles[status] || "bg-gray-50 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    showToast("Failed to load dashboard data", "error");
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-[#2C1810] mb-2">
          Welcome back, {user?.fullName?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-[#8B6F47]">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#D4A574]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-[#C1502E]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C1810]">
              {totalOrders}
            </div>
            <p className="text-xs text-[#8B6F47] mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-[#D4A574]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Pending Orders
            </CardTitle>
            <Clock className="h-5 w-5 text-[#D4A574]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C1810]">
              {pendingOrders}
            </div>
            <p className="text-xs text-[#8B6F47] mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-[#D4A574]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Total Spent
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#3E2723]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C1810]">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-[#8B6F47] mt-1">Lifetime value</p>
            {totalSpent > 50000 && (
              <Badge className="mt-2 bg-[#C1502E] text-white">
                VIP Customer
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              {totalOrders > 0 && (
                <Link href="/orders">
                  <Button variant="ghost" size="sm">
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-[#8B6F47] mb-4" />
                <p className="text-[#8B6F47] mb-6">No orders yet</p>
                <Link href="/shop">
                  <Button className="bg-[#C1502E] hover:bg-[#A04124]">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-4 border-b border-[#FAF6F1] last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#2C1810]">
                          #{order.orderNumber}
                        </p>
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#8B6F47] mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#2C1810]">
                        {formatCurrency(order.subtotal)}
                      </p>
                      <p className="text-xs text-[#8B6F47]">
                        {order.items.length} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map(({ title, desc, href, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group block p-5 rounded-xl border border-[#D4A574]/20 bg-[#FAF6F1] hover:bg-white hover:border-[#C1502E]/50 hover:shadow-md transition-all"
                >
                  <Icon
                    className={`h-8 w-8 ${color} mb-3 group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="font-semibold text-[#2C1810] text-sm">
                    {title}
                  </h3>
                  <p className="text-xs text-[#8B6F47] mt-1">{desc}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
