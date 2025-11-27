'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/Loading';
import { useOrders, usePayments } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Phone, Wallet, Package, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const { data: ordersData, isLoading } = useOrders.my();
  const { mutate: initiateMpesa } = usePayments.mpesaInitiate();
  const { mutate: initiateCrypto } = usePayments.cryptoInitiate();

  const [phoneInput, setPhoneInput] = useState<Record<string, string>>({});

  const orders = (ordersData?.orders as any[]) || [];
  
  const pendingOrders = orders.filter(order => 
    order.status === 'pending' && 
    !order.payments?.some((p: any) => p.status === 'completed')
  );

  if (authLoading || isLoading) return <PageLoading />;
  if (!user) return null;

  const handleMpesa = (orderId: number) => {
    const phone = phoneInput[orderId]?.trim() || '';
    if (!/^254\d{9}$/.test(phone.replace(/\D/g, ''))) {
      showToast('Enter valid number: 2547xxxxxxxxx', 'error');
      return;
    }
    initiateMpesa({ orderId, phone }, {
      onSuccess: () => showToast('Check your phone for M-Pesa prompt', 'success'),
      onError: () => showToast('Payment request failed', 'error'),
    });
  };

  const handleCrypto = (orderId: number) => {
    initiateCrypto({ orderId }, {
      onSuccess: (res: any) => window.location.href = res.paymentUrl || `/payment/crypto/${res.chargeId}`,
      onError: () => showToast('Crypto payment failed', 'error'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Pending Payments */}
        {pendingOrders.length > 0 && (
          <div className="mb-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="font-medium text-amber-900">
                You have {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} awaiting payment
              </p>
            </div>

            <div className="space-y-6">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-KE')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting Payment
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Items */}
                    <div>
                      <p className="font-medium mb-2">Items</p>
                      <div className="text-sm space-y-1">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.productName} × {item.quantity}</span>
                            <span className="font-medium">KSh {parseFloat(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex justify-between text-lg font-bold mb-6">
                        <span>Total</span>
                        <span>KSh {parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* M-Pesa */}
                        <div className="space-y-3">
                          <Input
                            placeholder="254712345678"
                            value={phoneInput[order.id] || ''}
                            onChange={(e) => setPhoneInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                          />
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleMpesa(order.id)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Pay with M-Pesa
                          </Button>
                        </div>

                        {/* Crypto */}
                        <div>
                          <Button 
                            variant="outline" 
                            className="w-full h-[52px]"
                            onClick={() => handleCrypto(order.id)}
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Pay with Crypto
                          </Button>
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
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No orders yet</p>
              <Link href="/shop">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders
                .filter(o => !pendingOrders.includes(o))
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-KE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KSh {parseFloat(order.totalAmount).toFixed(2)}</p>
                          <Badge className="mt-2" variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <Link href={`/orders/${order.orderNumber}`}>
                          <Button variant="ghost" size="sm">View Details →</Button>
                        </Link>
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