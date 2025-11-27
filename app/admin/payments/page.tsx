"use client";

import { useEffect, useState } from "react";
import { usePayments } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  DollarSign,
  User,
  Hash,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ────────────────────────────────────────────────────────────────
// Updated Payment interface + transformation from your real API
// ────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  orderId: string;
  orderNumber?: string;
  customer: { id: string; name: string; email: string };
  amount: number;
  currency: string;
  method: "mpesa" | "crypto" | "card" | "bank_transfer";
  status: "pending" | "confirmed" | "failed" | "cancelled" | "refunded";
  transactionId?: string;
  providerData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const transformApiPayment = (api: any): Payment => ({
  id: api.id.toString(),
  orderId: api.orderId.toString(),
  orderNumber: api.order.orderNumber,
  customer: {
    id: api.userId.toString(),
    name: api.order.user.fullName || "Unknown Customer",
    email: api.order.user.email || "N/A",
  },
  amount: parseFloat(api.amount),
  currency: "KES",
  method: api.paymentMethod as Payment["method"],
  status: api.status as Payment["status"],
  transactionId: api.transactionId || api.mpesaReceiptNumber || undefined,
  providerData: {
    mpesaPhoneNumber: api.mpesaPhoneNumber,
    mpesaReceiptNumber: api.mpesaReceiptNumber,
    checkoutRequestId: api.mpesaCheckoutRequestId,
    ...api.metadata,
  },
  createdAt: api.createdAt,
  updatedAt: api.updatedAt,
  completedAt: api.confirmedAt || undefined,
});

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = usePayments.all();

  // Transform API → UI format
  const payments: Payment[] = (data?.payments || []).map(transformApiPayment);

  const { mutate: confirmPayment, isPending: confirming } =
    usePayments.confirmPayment();

  // ────────────────────────────────────────────────────────────────
  // Filtering
  // ────────────────────────────────────────────────────────────────
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = !methodFilter || p.method === methodFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // ────────────────────────────────────────────────────────────────
  // Stats
  // ────────────────────────────────────────────────────────────────
  const confirmedPayments = filteredPayments.filter(
    (p) => p.status === "confirmed"
  );

  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0); // ← This is now real revenue
  const totalAmountEverProcessed = filteredPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const pendingAmount = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = confirmedPayments.length;
  const pendingCount = filteredPayments.filter(
    (p) => p.status === "pending"
  ).length;

  const formatCurrency = (amount: number, currency = "KES") =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(
      amount
    );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ────────────────────────────────────────────────────────────────
  // Badges
  // ────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const getMethodBadge = (method: string) => {
    const map: Record<string, string> = {
      mpesa: "bg-green-100 text-green-800",
      crypto: "bg-orange-100 text-orange-800",
      card: "bg-blue-100 text-blue-800",
      bank_transfer: "bg-purple-100 text-purple-800",
    };
    return map[method] || "bg-gray-100 text-gray-800";
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return <Phone className="h-4 w-4" />;
      case "crypto":
        return <Globe className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "bank_transfer":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  // ────────────────────────────────────────────────────────────────
  // Confirm handler
  // ────────────────────────────────────────────────────────────────
  const handleConfirm = (paymentId: string) => {
    confirmPayment(paymentId, {
      onSuccess: () => {
        showToast("Payment confirmed successfully", "success");
        refetch();
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment({
            ...selectedPayment,
            status: "confirmed",
            completedAt: new Date().toISOString(),
          });
        }
      },
      onError: () => showToast("Failed to confirm payment", "error"),
    });
  };

  // ────────────────────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Main UI
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C1810]">Payments</h1>
          <p className="text-[#8B6F47]">
            Monitor and manage all payment transactions
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isRefetching}>
          {isRefetching ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#C1502E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Pending Amount
            </CardTitle>
            <Clock className="h-5 w-5 text-[#D4A574]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-[#8B6F47]">{pendingCount} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">
              {completedCount}
            </div>
            <p className="text-xs text-[#8B6F47]">Successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8B6F47]">
              Pending
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">
              {pendingCount}
            </div>
            <p className="text-xs text-[#8B6F47]">Need confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by ID, order, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1502E]"
            >
              <option value="">All Methods</option>
              <option value="mpesa">Phone M-Pesa</option>
              <option value="card">Credit Card</option>
              <option value="crypto">Crypto</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1502E]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setMethodFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-[#FAF6F1]">
                <tr>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Payment ID
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Order
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Customer
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Amount
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Method
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Date
                  </th>
                  <th className="text-left p-4 font-medium text-[#2C1810]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-[#FAF6F1] transition"
                  >
                    <td className="p-4 font-mono text-sm">
                      ...{p.id.slice(-8)}
                    </td>
                    <td className="p-4 font-medium">
                      #{p.orderNumber || p.orderId}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{p.customer.name}</p>
                        <p className="text-sm text-[#8B6F47]">
                          {p.customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#2C1810]">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="p-4">
                      <Badge className={getMethodBadge(p.method)}>
                        {getMethodIcon(p.method)} {p.method.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(p.status)}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#8B6F47]">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPayment(p);
                            setOpenDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleConfirm(p.id)}
                            disabled={confirming}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-16">
                <CreditCard className="mx-auto h-12 w-12 text-[#8B6F47] mb-4" />
                <p className="text-[#8B6F47]">No payments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <CreditCard className="h-6 w-6 text-[#C1502E]" />
              Payment Details
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-[#FAF6F1] rounded-lg">
                <div className="flex items-center gap-4">
                  {selectedPayment.status === "confirmed" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : selectedPayment.status === "pending" ? (
                    <Clock className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <Badge className={getStatusBadge(selectedPayment.status)}>
                      {selectedPayment.status.toUpperCase()}
                    </Badge>
                    <Badge
                      className={`ml-2 ${getMethodBadge(
                        selectedPayment.method
                      )}`}
                    >
                      {getMethodIcon(selectedPayment.method)}{" "}
                      {selectedPayment.method.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-sm text-[#8B6F47]">
                    {formatDate(selectedPayment.createdAt)}
                  </span>
                </div>
                {selectedPayment.status === "pending" && (
                  <Button
                    onClick={() => handleConfirm(selectedPayment.id)}
                    disabled={confirming}
                  >
                    {confirming ? "Confirming..." : "Confirm Payment"}
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-5 w-5" /> Payment Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8B6F47]">
                        Payment ID:
                      </span>
                      <code className="text-sm font-mono">
                        {selectedPayment.id}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8B6F47]">Order:</span>
                      <span className="font-medium">
                        #{selectedPayment.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8B6F47]">Amount:</span>
                      <span className="text-2xl font-bold text-[#C1502E]">
                        {formatCurrency(
                          selectedPayment.amount,
                          selectedPayment.currency
                        )}
                      </span>
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[#8B6F47]">
                          Receipt No:
                        </span>
                        <code className="text-sm font-mono">
                          {selectedPayment.transactionId}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" /> Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-[#8B6F47]" />
                      <span>{selectedPayment.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#8B6F47]" />
                      <span className="text-sm">
                        {selectedPayment.customer.email}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedPayment.providerData &&
                Object.keys(selectedPayment.providerData).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Provider / Raw Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedPayment.providerData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
