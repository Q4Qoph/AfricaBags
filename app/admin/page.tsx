"use client";

import { format } from "date-fns";
import { useOrders } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
  Eye,
  Package,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const { showToast } = useToast();

  // This is the correct way — exactly like your customer Orders page
  const { data: ordersData, isLoading, error, refetch } = useOrders.all(); // Same hook, same pattern

  const orders = ordersData?.orders || [];

  // Compute everything from real orders — no fake data
  const totalSales = orders.reduce((sum: number, o: any) => {
    const hasConfirmedPayment = o.payments?.some(
      (p: any) => p.status === "confirmed"
    );

    if (!hasConfirmedPayment) return sum;

    const amount = Number(o.totalAmount) || Number(o.total) || 0;
    return sum + amount;
  }, 0);

  const totalOrders = orders.length;
  const uniqueCustomers = new Set(
    orders.map((o: any) => o.customer?.id || o.customerId)
  ).size;
  const pendingPayments = orders.filter(
    (o: any) =>
      o.paymentStatus === "pending" ||
      !o.payments?.some((p: any) => p.status === "completed")
  ).length;

  // Last 30 days sales
  const salesLast30Days = () => {
    const days: { date: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const amount = orders
        .filter((o: any) => o.createdAt?.startsWith(dateStr))
        .reduce(
          (sum: number, o: any) => sum + (o.totalAmount || o.total || 0),
          0
        );
      days.push({ date: dateStr, amount });
    }
    return days;
  };

  const salesData = salesLast30Days();
  const maxSales = Math.max(...salesData.map((d) => d.amount), 1);

  const recentOrders = orders
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  const formatDate = (date: string) => format(new Date(date), "dd MMM");

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      received: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-indigo-200 text-indigo-900",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800",
    };

    return map[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load dashboard</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Real-time overview of your store</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign />}
          title="Total Sales"
          value={formatCurrency(totalSales)}
        />
        <StatCard
          icon={<ShoppingCart />}
          title="Total Orders"
          value={totalOrders}
        />
        <StatCard icon={<Users />} title="Customers" value={uniqueCustomers} />
        <StatCard
          icon={<CreditCard />}
          title="Pending Payments"
          value={pendingPayments}
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid gap-6">
        {/* <Card>
          <CardHeader><CardTitle>Sales Trend (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {salesData.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 bg-orange-600 rounded-t hover:bg-orange-700 transition"
                  style={{ height: `${(day.amount / maxSales) * 100}%`, minHeight: '4px' }}
                  title={`${formatDate(day.date)}: ${formatCurrency(day.amount)}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      #{order.orderNumber || order.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer?.name || "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.totalAmount || order.total)}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reusable
function StatCard({ icon, title, value }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-orange-600">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
