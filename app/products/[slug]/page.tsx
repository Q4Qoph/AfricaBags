"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/badge";
import { useProducts, useReviews, useCart, useWishlist } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Fetch product by slug → response: { product: Product }
  const {
    data: productData,
    isLoading: loadingProduct,
    error: productError,
  } = useProducts.bySlug(slug);

  const product = productData?.product; // ← This is the key fix

  // Reviews → response: Review[]
  const { data: reviews = [], isLoading: loadingReviews } =
    useReviews.byProduct(product?.id || "");

  // All products for related → response: { products: Product[] }
  const { data: allProductsData } = useProducts.all();
  const allProducts = allProductsData?.products || [];

  // Wishlist → response: { wishlist: Product[] }
  const { data: wishlistData } = useWishlist.get();
  const wishlist = wishlistData?.wishlist || [];

  // Mutations
  const { mutate: addToCart, isPending: addingToCart } = useCart.add();
  const { mutate: addToWishlist } = useWishlist.add();
  const { mutate: removeFromWishlist } = useWishlist.remove();

  // Derived
  const relatedProducts = allProducts
    .filter((p: any) => p.id !== product?.id)
    .slice(0, 4);

  const isInWishlist = wishlist.some((item: any) => item.id === product?.id);

  const stock = product?.stockQuantity ?? product?.stock ?? 0;
  const price =
    typeof product?.price === "string"
      ? parseFloat(product.price)
      : product?.price || 0;
  const category = product?.bagType || product?.category || "Product";
  const colors = product?.color ? [product.color] : product?.colors || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
        reviews.length
      : parseFloat(product?.averageRating || "0");
  const totalReviews = product?.reviewCount || reviews.length;

  // Handlers
  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (stock === 0) {
      showToast("This item is out of stock", "error");
      return;
    }
    if (quantity > stock) {
      showToast(`Only ${stock} item(s) available`, "error");
      return;
    }

    addToCart(
      { productId: product.id, quantity },
      {
        onSuccess: () => showToast("Added to cart!", "success"),
        onError: () => showToast("Failed to add to cart", "error"),
      }
    );
  };

  const handleToggleWishlist = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id, {
        onSuccess: () => showToast("Removed from wishlist", "success"),
        onError: () => showToast("Error removing from wishlist", "error"),
      });
    } else {
      addToWishlist(product.id, {
        onSuccess: () => showToast("Added to wishlist!", "success"),
        onError: () => showToast("Error adding to wishlist", "error"),
      });
    }
  };

  if (loadingProduct) return <PageLoading />;

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2C1810] mb-4">
            Product Not Found
          </h1>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#3E2723] mb-8">
          <Link href="/" className="hover:text-[#C1502E]">
            Home
          </Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-[#C1502E]">
            Shop
          </Link>
          <span>›</span>
          <Link
            href={`/shop?category=${category}`}
            className="hover:text-[#C1502E]"
          >
            {category}
          </Link>
          <span>›</span>
          <span className="text-[#2C1810]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-white">
              <Image
                src={
                  product.images?.[selectedImageIndex]?.imageUrl ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
              {stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 bg-white ${
                      selectedImageIndex === i
                        ? "border-[#C1502E]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.imageUrl || "/placeholder.jpg"}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Badge variant="outline" className="mb-3 capitalize">
              {category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4">
              {product.name}
            </h1>

            {(totalReviews > 0 || averageRating > 0) && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.round(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[#3E2723]">
                  {averageRating.toFixed(1)} ({totalReviews} review
                  {totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            <p className="text-4xl font-bold text-[#C1502E] mb-6">
              Ksh {price.toFixed(2)}
            </p>

            <p className="text-[#3E2723] leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              {product.dimensions && (
                <div>
                  <strong className="text-[#2C1810]">Dimensions:</strong>{" "}
                  {product.dimensions}
                </div>
              )}
              {product.materials && (
                <div>
                  <strong className="text-[#2C1810]">Materials:</strong>{" "}
                  {product.materials}
                </div>
              )}
              {product.weight && (
                <div>
                  <strong className="text-[#2C1810]">Weight:</strong>{" "}
                  {product.weight}
                </div>
              )}
              {product.craftsmanshipTechnique && (
                <div>
                  <strong className="text-[#2C1810]">Craftsmanship:</strong>{" "}
                  {product.craftsmanshipTechnique}
                </div>
              )}
              {colors.length > 0 && (
                <div>
                  <strong className="text-[#2C1810]">Color:</strong>{" "}
                  <span className="capitalize">{colors.join(", ")}</span>
                </div>
              )}
              <div>
                <strong className="text-[#2C1810]">Stock:</strong>{" "}
                <span
                  className={
                    stock < 5 && stock > 0
                      ? "text-orange-600"
                      : "text-green-600"
                  }
                >
                  {stock > 0 ? `${stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-[#2C1810]">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(stock, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-16 text-center border-0 h-10 focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-[#8B4513]"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={stock === 0 || addingToCart}
                >
                  {addingToCart
                    ? "Adding..."
                    : stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </Button>

                <Button
                  variant={isInWishlist ? "secondary" : "outline"}
                  size="lg"
                  onClick={handleToggleWishlist}
                  className="px-4"
                >
                  {isInWishlist ? "♥" : "♡"}
                </Button>
              </div>
            </div>

            <div className="text-sm text-[#3E2723] space-y-2">
              <div className="flex items-center gap-2">
                <span>✓</span>
                 Free shipping on orders over $100
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                30-day return policy
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                Handcrafted with care
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                Secure payment options
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#2C1810] mb-6">
              Customer Reviews
            </h2>
            {loadingReviews ? (
              <p className="text-[#3E2723]">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.slice(0, 5).map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b pb-6 last:border-b-0"
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-medium text-[#2C1810]">
                          {review.userName || "Anonymous"}
                        </span>
                        {review.verifiedPurchase && (
                          <Badge className="ml-2 bg-green-100 text-green-700">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#3E2723]">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#3E2723]">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2C1810] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => {
                const pPrice =
                  typeof p.price === "string" ? parseFloat(p.price) : p.price;
                const pCat = p.bagType || p.category || "Product";

                return (
                  <Link key={p.id} href={`/products/${p.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow py-0">
                      <div className="aspect-square relative bg-white">
                        <Image
                          src={p.images?.[0]?.imageUrl || "/placeholder.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="p-4">
                        <Badge
                          variant="outline"
                          className="mb-2 capitalize text-xs"
                        >
                          {pCat}
                        </Badge>
                        <h3 className="font-medium text-[#2C1810] line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[#C1502E] font-bold">
                          Ksh {pPrice.toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
