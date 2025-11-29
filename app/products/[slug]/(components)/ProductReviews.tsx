// components/product/ProductReviews.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useReviews } from "@/lib/api";
import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loadingReviews,
    refetch,
  } = useReviews.byProduct(productId);

  const reviews = data?.reviews || [];
  const { mutate: submitReview } = useReviews.create();

  // 🔥 Submit Review Handler
  const handleSubmit = () => {
    if (!user) return;
    if (!rating) return showToast("Please select a rating", "error");
    if (!comment.trim()) return showToast("Please enter a comment", "error");

    setSubmitting(true);

    submitReview(
      { productId, comment: comment.trim(), qualityRating: rating },
      {
        onSuccess: () => {
          showToast("Review submitted!", "success");
          setComment("");
          setRating(0);
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["product", productId],
          });
        },
        onError: () => showToast("Failed to submit review", "error"),
        onSettled: () => setSubmitting(false),
      }
    );
  };

  // ⭐ Compute average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum: number, r: any) => sum + (r.rating || r.qualityRating),
          0
        ) / reviews.length
      : 0;

  return (
    <Card className="p-6 md:p-8 border-0 shadow-lg bg-white/95">
      {/* ---------- HEADER ---------- */}
      <h2 className="text-2xl md:text-3xl font-bold text-[#2C1810] mb-8">
        Customer Reviews
      </h2>

      {/* ---------- RATING SUMMARY ---------- */}
      {reviews.length > 0 && (
        <div className="flex justify-center mb-10 p-6 bg-amber-50 rounded-xl">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#C1502E]">
              {averageRating.toFixed(1)}
            </div>

            <div className="flex justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-7 h-7 ${
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-[#3E2723] mt-2">
              Based on {reviews.length} review
              {reviews.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ---------- WRITE REVIEW (ONLY WHEN LOGGED IN) ---------- */}
      {user && (
        <div className="mb-12 p-6 border border-amber-200 rounded-xl bg-amber-50/50">
          <h3 className="text-xl font-semibold text-[#2C1810] mb-4">
            Write a Review
          </h3>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-32 mb-4"
            disabled={submitting}
          />

          <Button
            onClick={handleSubmit}
            disabled={submitting || !rating || !comment.trim()}
            className="bg-[#C1502E] hover:bg-[#8B4513]"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {/* ---------- REVIEWS LIST ---------- */}
      <div className="space-y-8">
        {loadingReviews ? (
          <p className="text-center py-8">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-medium">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Be the first to review!
            </p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="border-b pb-8 last:border-b-0">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold">
                  {review.user.fullName || "Anonymous"}
                </span>

                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < (review.rating || review.qualityRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mb-3">{review.comment}</p>

              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
