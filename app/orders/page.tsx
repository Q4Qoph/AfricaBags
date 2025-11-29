"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/Loading";
import { api, useOrders, usePayments } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Wallet,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  X,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useOrders.my();
  const { mutate: initiateMpesa } = usePayments.mpesaInitiate();
  const { mutate: initiateCrypto } = usePayments.cryptoInitiate();

  const [phoneInput, setPhoneInput] = useState<Record<string, string>>({});
  const [pollingPayments, setPollingPayments] = useState<
    Record<number, boolean>
  >({});
  const [paymentStatus, setPaymentStatus] = useState<Record<number, string>>(
    {}
  );
  const [paymentError, setPaymentError] = useState<Record<number, string>>({});
  const [selectedMethod, setSelectedMethod] = useState<
    Record<number, "mpesa" | "crypto" | null>
  >({});
  const [copiedPhone, setCopiedPhone] = useState<Record<number, boolean>>({});
  const pollIntervals = useRef<Record<number, NodeJS.Timeout>>({});

  const orders = (ordersData?.orders as any[]) || [];

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" &&
      !order.payments?.some((p: any) => p.status === "completed")
  );

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach((interval) =>
        clearInterval(interval)
      );
    };
  }, []);

  const startPolling = (orderId: number, paymentId: number) => {
    setPollingPayments((prev) => ({ ...prev, [orderId]: true }));
    setPaymentStatus((prev) => ({
      ...prev,
      [orderId]: "Waiting for payment confirmation...",
    }));
    setPaymentError((prev) => ({ ...prev, [orderId]: "" }));

    let pollCount = 0;
    const maxPolls = 40;

    const pollPayment = async () => {
      try {
        pollCount++;

        const response: any = await api.payments.getOrderStatus(
          orderId.toString()
        );
        const payment = response.payments?.find((p: any) => p.id === paymentId);

        if (payment?.status === "completed") {
          clearInterval(pollIntervals.current[orderId]);
          setPollingPayments((prev) => ({ ...prev, [orderId]: false }));
          setPaymentStatus((prev) => ({
            ...prev,
            [orderId]: "Payment successful!",
          }));
          showToast("Payment completed successfully!", "success");

          // Refetch orders after payment completes
          setTimeout(async () => {
            await queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
            await queryClient.refetchQueries({ queryKey: ["orders", "my"] });
          }, 1000);
        } else if (payment?.status === "failed") {
          clearInterval(pollIntervals.current[orderId]);
          setPollingPayments((prev) => ({ ...prev, [orderId]: false }));
          setPaymentStatus((prev) => ({ ...prev, [orderId]: "" }));
          setSelectedMethod((prev) => ({ ...prev, [orderId]: null }));
          setPaymentError((prev) => ({
            ...prev,
            [orderId]:
              "Payment failed. The M-Pesa request was cancelled or timed out. Please try again.",
          }));

          // Refetch orders after payment fails
          setTimeout(async () => {
            await queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
            await queryClient.refetchQueries({ queryKey: ["orders", "my"] });
          }, 500);
        } else if (pollCount >= maxPolls) {
          // Stop after 2 minutes
          clearInterval(pollIntervals.current[orderId]);
          setPollingPayments((prev) => ({ ...prev, [orderId]: false }));
          setPaymentStatus((prev) => ({ ...prev, [orderId]: "" }));
          setSelectedMethod((prev) => ({ ...prev, [orderId]: null }));
          setPaymentError((prev) => ({
            ...prev,
            [orderId]:
              "Payment request timed out. Please try again or check your order status.",
          }));

          // Refetch orders after timeout
          setTimeout(async () => {
            await queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
            await queryClient.refetchQueries({ queryKey: ["orders", "my"] });
          }, 500);
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Don't stop polling on network errors, continue trying
      }
    };

    // Poll immediately, then every 3 seconds
    pollPayment();
    pollIntervals.current[orderId] = setInterval(pollPayment, 3000);
  };

  const cancelPolling = (orderId: number) => {
    if (pollIntervals.current[orderId]) {
      clearInterval(pollIntervals.current[orderId]);
      setPollingPayments((prev) => ({ ...prev, [orderId]: false }));
      setPaymentStatus((prev) => ({ ...prev, [orderId]: "" }));
      setSelectedMethod((prev) => ({ ...prev, [orderId]: null }));
      setPaymentError((prev) => ({ ...prev, [orderId]: "" }));
    }
  };

  const handleCopyPhone = (orderId: number) => {
    const phone = phoneInput[orderId] || "";
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone((prev) => ({ ...prev, [orderId]: true }));
      setTimeout(() => {
        setCopiedPhone((prev) => ({ ...prev, [orderId]: false }));
      }, 2000);
    }
  };

  if (authLoading || isLoading) return <PageLoading />;
  if (!user) return null;

  const handleMpesa = (orderId: number) => {
    const phone = phoneInput[orderId]?.trim() || "";
    if (!/^254\d{9}$/.test(phone.replace(/\D/g, ""))) {
      setPaymentError((prev) => ({
        ...prev,
        [orderId]: "Please enter a valid phone number (e.g., 254712345678)",
      }));
      return;
    }

    setPaymentError((prev) => ({ ...prev, [orderId]: "" }));

    initiateMpesa(
      { orderId, phoneNumber: phone },
      {
        onSuccess: (res: any) => {
          showToast("Check your phone for M-Pesa prompt", "success");
          if (res.payment?.id) {
            startPolling(orderId, res.payment.id);
          }
        },
        onError: (error: any) => {
          setPaymentError((prev) => ({
            ...prev,
            [orderId]:
              error?.message || "Payment request failed. Please try again.",
          }));
        },
      }
    );
  };

  const handleCrypto = (orderId: number) => {
    setPaymentError((prev) => ({ ...prev, [orderId]: "" }));

    initiateCrypto(
      { orderId },
      {
        onSuccess: (res: any) =>
          (window.location.href =
            res.invoiceUrl!),
        onError: (error: any) => {
          setPaymentError((prev) => ({
            ...prev,
            [orderId]:
              error?.message || "Crypto payment failed. Please try again.",
          }));
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your purchases</p>
        </div>

        {/* Pending Payments */}
        {pendingOrders.length > 0 && (
          <div className="mb-10">
            <div className="bg-orange-100 text-orange-700 rounded-xl p-5 mb-6 shadow-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                <div>
                  <p className="font-semibold text-lg">Action Required</p>
                  <p className="text-orange-700 text-sm">
                    {pendingOrders.length} order
                    {pendingOrders.length > 1 ? "s" : ""} awaiting payment
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {pendingOrders.map((order) => (
                <Card
                  key={order.id}
                  className="border-0 shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <CardHeader className="bg-white pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          #{order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-KE",
                            {
                              dateStyle: "long",
                            }
                          )}
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending Payment
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 bg-gray-50 p-6">
                    {/* Items */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Items
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold text-gray-900">
                              KSh {parseFloat(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white rounded-lg border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Total Amount
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                              KSh {parseFloat(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Order ID</p>
                            <p className="text-sm font-mono text-gray-700">
                              #{order.id}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Error Message */}
                        {paymentError[order.id] && (
                          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-semibold text-red-900 mb-1">
                                  Payment Error
                                </p>
                                <p className="text-sm text-red-700">
                                  {paymentError[order.id]}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setPaymentError((prev) => ({
                                    ...prev,
                                    [order.id]: "",
                                  }))
                                }
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}

                        {pollingPayments[order.id] ? (
                          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-orange-200">
                            <button
                              onClick={() => cancelPolling(order.id)}
                              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                              aria-label="Cancel"
                            >
                              <X className="w-4 h-4 text-gray-600" />
                            </button>

                            <div className="flex items-start gap-4 pr-8">
                              <div className="flex-shrink-0 mt-1">
                                <div className="relative">
                                  <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                                  <div className="absolute inset-0 bg-orange-400 rounded-full blur-sm opacity-30 animate-pulse" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-orange-900 mb-1">
                                  Processing Payment
                                </h4>
                                <p className="text-sm text-orange-700 leading-relaxed">
                                  {paymentStatus[order.id]}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex-1 bg-orange-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-orange-600 h-full w-2/3 rounded-full animate-pulse" />
                                  </div>
                                  <span className="text-xs text-orange-600 font-medium">
                                    Processing
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : !selectedMethod[order.id] ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700 mb-4">
                              Choose payment method
                            </p>

                            <button
                              onClick={() =>
                                setSelectedMethod((prev) => ({
                                  ...prev,
                                  [order.id]: "mpesa",
                                }))
                              }
                              className="w-full bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 rounded-xl p-4 transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    M-Pesa
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Pay using M-Pesa mobile money
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() =>
                                setSelectedMethod((prev) => ({
                                  ...prev,
                                  [order.id]: "crypto",
                                }))
                              }
                              className="w-full bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-2 border-gray-300 hover:border-gray-400 rounded-xl p-4 transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    Cryptocurrency
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Pay using crypto wallet
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        ) : selectedMethod[order.id] === "mpesa" ? (
                          <div className="space-y-4">
                            <button
                              onClick={() =>
                                setSelectedMethod((prev) => ({
                                  ...prev,
                                  [order.id]: null,
                                }))
                              }
                              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 mb-2"
                            >
                              ← Change payment method
                            </button>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                  <Phone className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">
                                  M-Pesa Payment
                                </h3>
                              </div>

                              <div>
                                <label
                                  htmlFor={`phone-${order.id}`}
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Enter phone number
                                </label>
                                <input
                                  id={`phone-${order.id}`}
                                  type="tel"
                                  placeholder="254712345678"
                                  value={phoneInput[order.id] || ""}
                                  onChange={(e) =>
                                    setPhoneInput((prev) => ({
                                      ...prev,
                                      [order.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-gray-900 placeholder-gray-400"
                                />
                                <p className="text-xs text-gray-600 mt-1.5">
                                  Enter the M-Pesa number that will be charged
                                </p>
                              </div>

                              {phoneInput[order.id] && (
                                <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">
                                      Number to pay from:
                                    </span>
                                    <span className="font-mono ml-2 text-gray-900">
                                      {phoneInput[order.id]}
                                    </span>
                                  </p>
                                  <button
                                    onClick={() => handleCopyPhone(order.id)}
                                    className="w-full bg-white hover:bg-gray-50 border border-green-300 hover:border-green-400 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                  >
                                    {copiedPhone[order.id] ? (
                                      <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy phone number</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => handleMpesa(order.id)}
                                disabled={!phoneInput[order.id]}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg disabled:shadow-sm transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <Phone className="w-5 h-5" />
                                <span>Pay with M-Pesa</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <button
                              onClick={() =>
                                setSelectedMethod((prev) => ({
                                  ...prev,
                                  [order.id]: null,
                                }))
                              }
                              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 mb-2"
                            >
                              ← Change payment method
                            </button>

                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                  <Wallet className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">
                                  Cryptocurrency Payment
                                </h3>
                              </div>

                              <p className="text-sm text-gray-600">
                                You will be redirected to complete your crypto
                                payment securely.
                              </p>

                              <button
                                onClick={() => handleCrypto(order.id)}
                                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <Wallet className="w-5 h-5" />
                                <span>Continue to payment</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Secure payment processing</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Orders */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Order History
          </h2>

          {orders.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start shopping to see your orders here
                </p>
                <Link href="/shop">
                  <Button className="bg-gradient-to-r from-[#D4A574] to-[#C1502E] hover:from-[#C1502E] hover:to-[#D4A574] text-white font-semibold px-8 py-6">
                    Browse Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders
                .filter((o) => !pendingOrders.includes(o))
                .map((order) => (
                  <Card
                    key={order.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold text-gray-900">
                              #{order.orderNumber}
                            </p>
                            <Badge
                              className={
                                order.status === "completed"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-orange-100 text-orange-700 border-orange-200"
                              }
                            >
                              {order.status === "completed" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-KE",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              KSh {parseFloat(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                          <Link href={`/orders/${order.orderNumber}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-semibold text-[#D4A574] hover:text-[#C1502E] hover:bg-orange-50"
                            >
                              View Details →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
