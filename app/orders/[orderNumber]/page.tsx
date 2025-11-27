'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/Loading';
import { useOrders, usePayments } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Package, MapPin, Clock, AlertCircle, Phone, Wallet, Calendar, DollarSign } from 'lucide-react';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const orderNumber = params.orderNumber as string;

  const { data: orderData, isLoading: loadingOrder } = useOrders.byNumber(orderNumber);
  const { mutate: initiateMpesa } = usePayments.mpesaInitiate();
  const { mutate: initiateCrypto } = usePayments.cryptoInitiate();

  const [phone, setPhone] = useState('');

  const order = orderData?.order as any;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Pre-fill phone from address if available
  useEffect(() => {
    if (order?.address?.phone) {
      setPhone(order.address.phone);
    }
  }, [order]);

  const isPendingPayment = order?.status === 'pending' && 
    !order.payments?.some((p: any) => p.status === 'completed');

  const hasFailedPayment = order?.payments?.some((p: any) => p.status === 'failed');

  const handlePayMpesa = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^254\d{9}$/.test(cleanPhone)) {
      showToast('Please enter a valid Kenyan phone number (254xxxxxxxxx)', 'error');
      return;
    }

    initiateMpesa(
      { orderId: order.id, phone: cleanPhone },
      {
        onSuccess: () => showToast('M-Pesa prompt sent! Check your phone', 'success'),
        onError: () => showToast('Payment failed', 'error'),
      }
    );
  };

  const handlePayCrypto = () => {
    initiateCrypto(
      { orderId: order.id },
      {
        onSuccess: (res: any) => {
          window.location.href = res.paymentUrl || `/payment/crypto/${res.chargeId}`;
        },
        onError: () => showToast('Crypto payment failed', 'error'),
      }
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (authLoading || loadingOrder) return <PageLoading />;
  if (!user || !order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex gap-3">
              <Badge variant={order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              {isPendingPayment ? (
                <Badge className="bg-orange-100 text-orange-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting Payment
                </Badge>
              ) : hasFailedPayment ? (
                <Badge variant="destructive">Payment Failed</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pending Payment Alert */}
            {isPendingPayment && (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg">Payment Required</h3>
                      <p className="text-gray-700 mt-1">
                        This order is waiting for payment. Complete payment to proceed with delivery.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="254712345678"
                          className="text-lg"
                        />
                        <Button
                          onClick={handlePayMpesa}
                          className="w-full mt-3 bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Pay KSh {parseFloat(order.totalAmount).toFixed(2)} with M-Pesa
                        </Button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Or Pay with Crypto</label>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
                          <p className="font-medium">BTC • ETH • USDT • USDC</p>
                        </div>
                        <Button
                          onClick={handlePayCrypto}
                          variant="outline"
                          className="w-full mt-3 border-purple-600 text-purple-700 hover:bg-purple-50"
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Pay with Cryptocurrency
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold">KSh {parseFloat(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <p className="font-medium">{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p className="text-gray-600">{order.address.addressLine2}</p>}
                  <p className="text-gray-600">
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p className="text-gray-600">{order.address.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KSh {parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>KSh {parseFloat(order.taxAmount || '0').toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">KSh {parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.payments.map((payment: any) => (
                      <div key={payment.id} className="text-sm p-3 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span className="capitalize">{payment.paymentMethod}</span>
                          <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                        {payment.mpesaPhoneNumber && (
                          <p className="text-xs text-gray-600 mt-1">Phone: {payment.mpesaPhoneNumber}</p>
                        )}
                        {payment.metadata?.resultDesc && payment.status === 'failed' && (
                          <p className="text-xs text-red-600 mt-1">{payment.metadata.resultDesc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}