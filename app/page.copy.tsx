"use client";

import Image from "next/image";
import Link from "next/link";
import { PageLoading } from "@/components/ui/Loading";
import { useProducts } from "@/lib/api"; // Same hook as ShopPage!
import { Product } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { showToast } = useToast();

  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useProducts.featured();

  const {
    data: arrivalsData,
    isLoading: arrivalsLoading,
    error: arrivalsError,
  } = useProducts.newArrivals();

  const {
    data: bestSellersData,
    isLoading: bestSellersLoading,
    error: bestSellersError,
  } = useProducts.bestSellers();

  // Global error handling
  useEffect(() => {
    if (featuredError || arrivalsError || bestSellersError) {
      showToast("Error loading products", "error");
    }
  }, [featuredError, arrivalsError, bestSellersError, showToast]);

  // Unified loading state
  const isLoading = featuredLoading || arrivalsLoading || bestSellersLoading;

  if (isLoading) {
    return <PageLoading />;
  }

  const featuredProducts = featuredData?.products || [];
  const newArrivals = arrivalsData?.products || [];
  const bestSellers = bestSellersData?.products || [];

  const formatPrice = (product: Product) =>
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-[#2C1810] to-[#3E2723] text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Crafted with Passion
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover unique handcrafted furniture and home decor that tells a
            story
          </p>
          <Link href="/shop">
            <Button size="lg" className="text-lg px-8 py-4">
              Shop Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2C1810]">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 6).map((product: any) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative bg-white">
                  <Image
                    src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#2C1810]">
                    {product.name}
                  </h3>
                  <p className="text-[#3E2723] mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#C1502E]">
                      ${formatPrice(product).toFixed(2)}
                    </span>
                    <Link href={`/products/${product.slug}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2C1810]">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product: any) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative bg-white">
                  <Image
                    src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#C1502E] text-white px-2 py-1 text-xs font-semibold rounded">
                      NEW
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 text-[#2C1810]">
                    {product.name}
                  </h3>
                  <p className="text-[#C1502E] font-bold">
                    ${formatPrice(product).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2C1810]">
            Best Sellers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestSellers.slice(0, 3).map((product: any) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative bg-white">
                  <Image
                    src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#D4A574] text-[#2C1810] px-2 py-1 text-xs font-semibold rounded">
                      BEST SELLER
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#2C1810]">
                    {product.name}
                  </h3>
                  <p className="text-[#3E2723] mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-[#C1502E]">
                      ${formatPrice(product).toFixed(2)}
                    </span>
                    <Link href={`/products/${product.slug}`}>
                      <Button>Add to Cart</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-[#3E2723] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Our Craftsmanship Story
          </h2>
          <p className="text-lg md:text-xl mb-8 leading-relaxed">
            Every piece in our collection is carefully handcrafted by skilled
            artisans who pour their passion and expertise into creating unique,
            high-quality furniture and home decor. We believe in the beauty of
            imperfection and the character that comes with handmade
            craftsmanship.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4A574] mb-2">10+</div>
              <p className="text-sm">Years of Experience</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4A574] mb-2">500+</div>
              <p className="text-sm">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4A574] mb-2">
                1000+
              </div>
              <p className="text-sm">Unique Pieces Created</p>
            </div>
          </div>
          <Link href="/shop" className="inline-block mt-8">
            <Button variant="secondary" size="lg">
              Explore Our Story
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
