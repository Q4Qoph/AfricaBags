"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useOrders } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

import {
  Search,
  Eye,
  Package,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusOptions = [
  "pending",
  "received",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Modern data fetching
  const { data: ordersData, isLoading, error, refetch } = useOrders.all();

  const { mutate: updateStatus, isPending: updating } =
    useOrders.updateStatus();

  const orders = ordersData?.orders || [];

  // Client-side filtering
  const filteredOrders = orders.filter((order: any) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search) ||
      order.user?.fullName?.toLowerCase().includes(search) ||
      order.user?.email?.toLowerCase().includes(search);

    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment =
      !paymentFilter || order.paymentStatus === paymentFilter;
    const matchesDate =
      !dateFilter ||
      format(new Date(order.createdAt), "yyyy-MM-dd") === dateFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateStatus(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          showToast("Order status updated", "success");
          if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
        },
        onError: () => showToast("Failed to update status", "error"),
      }
    );
  };

  const openOrderDialog = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  const formatDate = (date: string) =>
    format(new Date(date), "dd MMM yyyy, HH:mm");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-purple-100 text-purple-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-200 text-red-900",
    };

    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load orders</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium">Order</th>
                  <th className="text-left py-4 px-6 font-medium">Customer</th>
                  <th className="text-left py-4 px-6 font-medium">Date</th>
                  <th className="text-left py-4 px-6 font-medium">Total</th>
                  <th className="text-left py-4 px-6 font-medium">Payment</th>
                  <th className="text-left py-4 px-6 font-medium">Status</th>
                  <th className="text-left py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">
                      #{order.orderNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">
                          {order.user?.fullName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {formatCurrency(order.totalAmount || order.total)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        className={getStatusColor(
                          order.paymentStatus || "pending"
                        )}
                      >
                        {order.paymentStatus || "pending"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Select
                        value={order.status}
                        disabled={updating}
                        onValueChange={(value) =>
                          handleUpdateStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openOrderDialog(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No orders match your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog (shadcn) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - #{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Created on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status Badges */}
              <div className="flex gap-3 flex-wrap">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </Badge>
                <Badge
                  className={getStatusColor(
                    selectedOrder.paymentStatus || "pending"
                  )}
                >
                  Payment: {selectedOrder.paymentStatus || "pending"}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" /> Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">
                      {selectedOrder.customer?.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedOrder.customer?.email}
                    </p>
                    {selectedOrder.customer?.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customer.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping */}
                {selectedOrder.shippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div>{selectedOrder.shippingAddress.street}</div>
                      <div>
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </div>
                      <div>{selectedOrder.shippingAddress.country}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" /> Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(
                            item.total || item.price * item.quantity
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.subtotal || selectedOrder.totalAmount
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-3">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.totalAmount || selectedOrder.total
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Status Update */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <span className="font-medium">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(v) => handleUpdateStatus(selectedOrder.id, v)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
