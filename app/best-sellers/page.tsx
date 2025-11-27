"use client";

import Link from "next/link";
import { PageLoading } from "@/components/ui/Loading";
import { useProducts } from "@/lib/api"; // Same hook used everywhere
import { Product } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BestSellersPage() {
  const { showToast } = useToast();

  // Use the same React Query hook pattern
  const { data, isLoading, error } = useProducts.bestSellers(); // This matches your Home & Shop pattern

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast("Failed to load best sellers", "error");
    }
  }, [error, showToast]);

  if (isLoading) return <PageLoading />;

  const products = data?.products || [];

  return (
    <div className="bg-[#FAF6F1] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-[#2C1810] mb-4">
            Best Sellers
          </h1>
          <p className="text-gray-700 text-lg">
            Our customers' favorite handcrafted bags
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No best sellers yet</p>
            <Link href="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => {
              const price =
                typeof product.price === "string"
                  ? parseFloat(product.price)
                  : product.price;

              return (
                <Link href={`/products/${product.slug}`} key={product.id}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow relative group">
                    <Badge
                      className="absolute top-3 left-3 z-10"
                      variant="default"
                    >
                      Best Seller
                    </Badge>

                    <div className="aspect-square relative bg-white">
                      <Image
                        src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[#2C1810] mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[#C1502E] font-bold text-xl">
                        ${price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
