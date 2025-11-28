// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/Loading";
import { useCart, useAddresses, useOrders } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { MapPin, Receipt, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

import { AddressModal, type AddressFormData } from "@/components/AddressModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const { data: cartData, isLoading: loadingCart } = useCart.get();
  const { data: addressesData, isLoading: loadingAddresses, refetch: refetchAddresses } = useAddresses.all();
  const { mutate: createOrder, isPending: creatingOrder } = useOrders.create();
  const { mutate: createAddress, isPending: creatingAddress } = useAddresses.create();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const cartItems = cartData?.cart || [];
  const addresses = addressesData?.addresses || [];
  const selectedAddress = addresses.find((a: any) => a.id === selectedAddressId);

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const total = subtotal;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  if (!authLoading && !user) {
    router.replace("/login");
    return null;
  }
  if (loadingCart || loadingAddresses) return <PageLoading />;
  if (!cartItems.length) {
    router.replace("/cart");
    return null;
  }

  // This sends the EXACT same field names your form uses
  const handleSaveAddress = (formData: AddressFormData) => {
    createAddress(
      {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || null,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        postalCode: formData.postalCode || null,
        isDefault: formData.isDefault,
      },
      {
        onSuccess: () => {
          showToast("Address added successfully!", "success");
          refetchAddresses();
          setIsAddressModalOpen(false);
        },
        onError: () => showToast("Failed to save address", "error"),
      }
    );
  };

  const handleCreateOrder = () => {
    if (!selectedAddress) {
      showToast("Please select a delivery address", "error");
      return;
    }

    createOrder(
      { addressId: selectedAddress.id },
      {
        onSuccess: () => {
          showToast("Order created successfully!", "success");
          router.push("/orders");
        },
        onError: () => showToast("Failed to create order", "error"),
      }
    );
  };

  const steps = [
    { number: 1, name: "Address", icon: MapPin },
    { number: 2, name: "Review", icon: Receipt },
  ];

  // Helper to format address for display
  const formatAddress = (addr: any) => {
    const line2 = addr.addressLine2 ? `, ${addr.addressLine2}` : "";
    const state = addr.state ? `, ${addr.state}` : "";
    const postal = addr.postalCode ? ` ${addr.postalCode}` : "";
    return `${addr.addressLine1}${line2}, ${addr.city}${state}, ${addr.country || "Kenya"}${postal}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header + Progress */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-3 rounded-full hover:bg-white/60 transition">
              <ArrowLeft className="w-6 h-6 text-[#2C1810]" />
            </button>
            <h1 className="text-4xl font-bold text-[#2C1810]">Checkout</h1>
          </div>

          <div className="flex items-center justify-center gap-16">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const active = step.number === currentStep;
              const done = step.number < currentStep;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all ${
                      active
                        ? "bg-[#C1502E] text-white"
                        : done
                        ? "bg-green-500 text-white"
                        : "bg-white text-[#3E2723]"
                    }`}
                  >
                    {done ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    <span className="hidden sm:inline">{step.name}</span>
                    <span className="sm:hidden">{step.number}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-40 h-1.5 ${done ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-10">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div>
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-3 text-3xl text-[#2C1810]">
                      <MapPin className="w-8 h-8" /> Delivery Address
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-0 mt-8 space-y-5">
                    {addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`border-3 rounded-2xl p-8 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-[#C1502E] bg-[#C1502E]/5 shadow-lg"
                            : "border-gray-200 hover:border-[#D4A574]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xl font-bold text-[#2C1810]">
                              {addr.addressLine1}
                            </p>
                            <p className="text-[#3E2723] mt-1 text-sm leading-relaxed">
                              {formatAddress(addr)}
                            </p>
                            {addr.isDefault && <Badge className="mt-3">Default Address</Badge>}
                          </div>
                          <div
                            className={`w-7 h-7 rounded-full border-4 ${
                              selectedAddressId === addr.id
                                ? "border-[#C1502E] bg-[#C1502E]"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full h-16 text-xl font-medium"
                      onClick={() => setIsAddressModalOpen(true)}
                      disabled={creatingAddress}
                    >
                      {creatingAddress ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Address...
                        </>
                      ) : (
                        "+ Add New Address"
                      )}
                    </Button>
                  </CardContent>
                </div>
              )}

              {/* Step 2: Review */}
              {currentStep === 2 && (
                <div>
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-3 text-3xl text-[#2C1810]">
                      <Receipt className="w-8 h-8" /> Review Your Order
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-0 mt-8 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Delivery Address</h3>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <p className="font-bold text-lg">{selectedAddress?.addressLine1}</p>
                        <p className="text-[#3E2723] mt-1 text-sm leading-relaxed">
                          {formatAddress(selectedAddress)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white relative">
                              {item.product.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="bg-gray-200 w-full h-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-[#3E2723]">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold">KSh {item.subtotal.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep(1)}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>

                {currentStep === 1 ? (
                  <Button
                    size="lg"
                    disabled={!selectedAddress}
                    onClick={() => setCurrentStep(2)}
                    className="px-12 bg-[#C1502E] hover:bg-[#A0442A]"
                  >
                    Review Order
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleCreateOrder}
                    disabled={creatingOrder}
                    className="px-16 text-xl font-bold bg-[#C1502E] hover:bg-[#A0442A]"
                  >
                    {creatingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      `Create Order – KSh ${total.toFixed(2)}`
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24">
              <CardTitle className="text-2xl mb-6">Order Summary</CardTitle>
              <div className="space-y-6">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-[#3E2723]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">KSh {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold pt-6 border-t text-[#C1502E]">
                    <span>Total</span>
                    <span>KSh {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Your EXACT AddressModal — 100% untouched */}
        <AddressModal
          open={isAddressModalOpen}
          onOpenChange={setIsAddressModalOpen}
          onSubmit={handleSaveAddress}
        />
      </div>
    </div>
  );
}