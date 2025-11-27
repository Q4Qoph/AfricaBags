"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/lib/api";
import { useCart } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useEffect } from "react";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const {
    data: rawData,
    isLoading: loadingWishlist,
    error,
  } = useWishlist.get();

  const { mutate: removeFromWishlist, isPending: removing } =
    useWishlist.remove();
  const { mutate: addToCart, isPending: addingToCart } = useCart.add();

  // Transform nested wishlist items → flat Product[]
  const wishlistItems: any[] =
    rawData?.wishlist?.map((item: any) => ({
      ...item.product,
      wishlistId: item.id, // optional: keep wishlist entry ID if needed
    })) || [];

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (error) showToast("Failed to load wishlist", "error");
  }, [error, showToast]);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId, {
      onSuccess: () => showToast("Removed from wishlist", "success"),
      onError: () => showToast("Failed to remove", "error"),
    });
  };

  const handleAddToCart = (product: any) => {
    if (product.stockQuantity === 0) {
      showToast("Out of stock", "error");
      return;
    }

    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => showToast("Added to cart!", "success"),
        onError: () => showToast("Failed to add", "error"),
      }
    );
  };

  const moveAllToCart = () => {
    const available = wishlistItems.filter((p: any) => p.stockQuantity > 0);
    if (!available.length) {
      showToast("No items in stock", "error");
      return;
    }
    available.forEach((p: any) => addToCart({ productId: p.id, quantity: 1 }));
    showToast(`Added ${available.length} items to cart!`, "success");
  };

  if (authLoading || loadingWishlist) return <PageLoading />;
  if (!user) return null;

  const availableCount = wishlistItems.filter(
    (p: any) => p.stockQuantity > 0
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-4">
            My Wishlist
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            {wishlistItems.length > 0 && (
              <Button className="bg-[#C1502E] hover:bg-[#A0442A]" onClick={moveAllToCart} disabled={availableCount === 0}>
                Add Available to Cart ({availableCount})
              </Button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-[#D4A574]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mt-6 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-[#3E2723] mb-8">
              Save your favorite pieces for later
            </p>
            <Link href="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <Card className="mb-8 p-6">
              <p className="text-xl font-semibold">
                {wishlistItems.length} item{wishlistItems.length > 1 ? "s" : ""}{" "}
                saved
              </p>
              <p className="text-[#3E2723]">
                {availableCount} in stock •{" "}
                {wishlistItems.length - availableCount} unavailable
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product: any) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow py-0"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge className="bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      </div>
                    )}

                    {product.stockQuantity < 5 && product.stockQuantity > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white">
                          Low Stock
                        </Badge>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      className="absolute top-3 left-3 h-8 w-8 bg-white/90 text-red-600"
                      onClick={() => handleRemove(product.id)}
                      disabled={removing}
                    >
                      {removing ? "..." : "×"}
                    </Button>
                  </div>

                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {product.bagType || "Bag"}
                    </Badge>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-[#2C1810] hover:text-[#C1502E] line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-[#C1502E]">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#C1502E] hover:bg-[#A0442A]"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stockQuantity === 0 || addingToCart}
                      >
                        {addingToCart ? "Adding..." : "Add to Cart"}
                      </Button>
                      <Link href={`/products/${product.slug}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
