"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();

  const productsPerPage = 12;

  // Fetch products using React Query
  const { data, isLoading, error } = useProducts.all();

  // Show error toast when query fails
  useEffect(() => {
    if (error) {
      showToast("Error loading products", "error");
    }
  }, [error]);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    let filtered = [...data.products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => {
        const category = product.bagType || product.category || "";
        return category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Material filter
    if (selectedMaterial !== "All") {
      filtered = filtered.filter((product) => {
        const material = product.material || "";
        return material.toLowerCase() === selectedMaterial.toLowerCase();
      });
    }

    // Color filter
    if (selectedColor !== "All") {
      filtered = filtered.filter((product) => {
        if (product.color) {
          return product.color.toLowerCase() === selectedColor.toLowerCase();
        }
        if (product.colors && product.colors.length > 0) {
          return product.colors.some(
            (color: any) => color.toLowerCase() === selectedColor.toLowerCase()
          );
        }
        return false;
      });
    }

    // Price filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((product) => {
        const price =
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const priceA =
        typeof a.price === "string" ? parseFloat(a.price) : a.price;
      const priceB =
        typeof b.price === "string" ? parseFloat(b.price) : b.price;

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [
    data?.products,
    searchQuery,
    selectedCategory,
    selectedMaterial,
    selectedColor,
    priceRange,
    sortBy,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedMaterial,
    selectedColor,
    priceRange,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedColor("All");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-4">
            Shop Collection
          </h1>
          <p className="text-[#3E2723] text-lg">
            Discover our latest handcrafted bags from East African artisans
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              Filters {showFilters ? "−" : "+"}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C1502E]"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Grid */}
          <div className="flex-1">
            {/* Results info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-[#3E2723]">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </p>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#3E2723] text-lg mb-4">
                  No products found matching your criteria
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product) => {
                    const stock = product.stockQuantity ?? product.stock ?? 0;
                    const price =
                      typeof product.price === "string"
                        ? parseFloat(product.price)
                        : product.price;
                    const category =
                      product.bagType || product.category || "Product";
                    const isFeatured = product.isFeatured;

                    return (
                      <Card
                        key={product.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow py-0"
                      >
                        <div className="aspect-square relative bg-green-800">
                          <Image
                            src={
                              product.images[0]?.imageUrl || "/placeholder.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {isFeatured && (
                            <div className="absolute top-3 left-3">
                              <Badge variant="secondary">Featured</Badge>
                            </div>
                          )}
                          {stock < 5 && stock > 0 && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-orange-500 text-white">
                                Low Stock
                              </Badge>
                            </div>
                          )}
                          {stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge className="bg-red-500 text-white">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="mb-2">
                            <Badge variant="outline" className="capitalize">
                              {category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-[#2C1810] mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          {/* <p className="text-[#3E2723] text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p> */}
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-[#C1502E]">
                              Ksh {price.toFixed(2)}
                            </span>
                            <Link href={`/products/${product.slug}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page =
                        currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <Button
                          key={page}
                          // variant={currentPage === page ? "primary" : "outline"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
