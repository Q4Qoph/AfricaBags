"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Track which item is being updated/removed
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  // React Query hooks
  const {
    data: cartData,
    isLoading: loadingCart,
    refetch: refetchCart,
  } = useCart.get();

  const { data: cartSummary } = useCart.summary();

  const { mutate: updateQuantity } = useCart.update();
  const { mutate: removeItem } = useCart.remove();
  const { mutate: clearCart, isPending: clearingCart } = useCart.clear();

  // Extract cart data
  const cartItems = cartData?.cart || [];
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.subtotal,
    0
  );
  const itemCount = cartSummary?.itemCount || cartItems.length;

  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = (subtotal + shipping) * 0.1;
  const grandTotal = subtotal + shipping + tax;

  // Redirect if not logged in
  if (!authLoading && !user) {
    router.replace("/login");
    return null;
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setProcessingItemId(itemId);

    updateQuantity(
      { id: itemId, quantity },
      {
        onSuccess: () => {
          showToast("Cart updated", "success");
          refetchCart();
        },
        onError: () => showToast("Failed to update quantity", "error"),
        onSettled: () => setProcessingItemId(null),
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setProcessingItemId(itemId);

    removeItem(itemId, {
      onSuccess: () => {
        showToast("Item removed", "success");
        refetchCart();
      },
      onError: () => showToast("Failed to remove item", "error"),
      onSettled: () => setProcessingItemId(null),
    });
  };

  const handleClearCart = () => {
    if (!confirm("Clear your entire cart?")) return;

    clearCart(undefined, {
      onSuccess: () => {
        showToast("Cart cleared", "success");
        refetchCart();
      },
      onError: () => showToast("Failed to clear cart", "error"),
    });
  };

  const proceedToCheckout = () => {
    if (itemCount === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    router.push("/checkout");
  };

  if (authLoading || loadingCart) return <PageLoading />;

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-2">
            Shopping Cart
          </h1>
          <p className="text-[#3E2723] mb-6">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleClearCart}
                disabled={clearingCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {clearingCart ? "Clearing..." : "Clear Cart"}
              </Button>
            )}
          </div>
        </div>

        {itemCount === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-[#D4A574]/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#D4A574]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#2C1810] mb-4">
                Your cart is empty
              </h2>
              <p className="text-[#3E2723] mb-8">
                Looks like you haven’t added anything to your cart yet.
              </p>
              <Link href="/shop">
                <Button size="lg">Start Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item: any) => {
                const product = item.product;
                const isProcessing = processingItemId === item.id;

                return (
                  <Card key={item.id} className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-28 h-28 relative rounded-lg overflow-hidden bg-white">
                          <Image
                            src={
                              product.image ||
                              product.images?.[0]?.imageUrl ||
                              "/placeholder.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-xl font-semibold text-[#2C1810] hover:text-[#C1502E] line-clamp-2"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-lg font-bold text-[#C1502E]">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          {item.quantity > product.stockQuantity && (
                            <Badge variant="destructive">Out of stock</Badge>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={isProcessing || item.quantity <= 1}
                              className="h-10 w-10 p-0"
                            >
                              −
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const q = Math.max(
                                  1,
                                  parseInt(e.target.value) || 1
                                );
                                if (q !== item.quantity)
                                  handleUpdateQuantity(item.id, q);
                              }}
                              className="w-16 text-center border-0 h-10"
                              min="1"
                              max={product.stockQuantity}
                              disabled={isProcessing}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                isProcessing ||
                                item.quantity >= product.stockQuantity
                              }
                              className="h-10 w-10 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isProcessing}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isProcessing ? "Removing..." : "Remove"}
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#2C1810]">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-[#2C1810] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span className="text-[#3E2723]">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#3E2723]">Shipping</span>
                    <span
                      className={
                        shipping === 0 ? "text-green-600 font-medium" : ""
                      }
                    >
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#3E2723]">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-[#2C1810]">Total</span>
                      <span className="text-[#C1502E]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {subtotal < 100 && (
                    <div className="mt-6 p-4 bg-[#D4A574]/20 rounded-lg text-center">
                      <p className="text-sm font-medium text-[#2C1810]">
                        Add ${(100 - subtotal).toFixed(2)} more for{" "}
                        <span className="text-green-600">FREE shipping</span>!
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-8 bg-[#C1502E] hover:bg-[#A0442A]"
                  size="lg"
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
