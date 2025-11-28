"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const { register, error, clearError } = useAuth(); // ← use error from context
  const router = useRouter();

  const fullNameRef = useRef<HTMLInputElement>(null);
  useEffect(() => fullNameRef.current?.focus(), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // clear previous error

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber.replace(/\s/g, ""),
        password: formData.password,
      });

      router.push("/");
    } catch {
      // Error is already set in AuthContext → just let it display below
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810] mb-2">
            Create Account
          </h1>
          <p className="text-[#3E2723]">Join our crafting community</p>
        </div>

        {/* Inline Error – same style as Login */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Full Name
            </label>
            <Input
              ref={fullNameRef}
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+254712345678"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              disabled={loading}
              minLength={8}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              placeholder="Confirm password"
              disabled={loading}
              required
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#C1502E] focus:ring-[#C1502E] mt-0.5"
              required
            />
            <label htmlFor="terms" className="ml-3 text-sm text-[#3E2723]">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-[#C1502E] hover:text-[#A0421F] font-medium"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#C1502E] hover:text-[#A0421F] font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium bg-[#C1502E] hover:bg-[#A0421F]"
            disabled={loading}
            size="lg"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#3E2723]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#C1502E] hover:text-[#A0421F]"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
