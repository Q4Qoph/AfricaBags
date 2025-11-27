"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showToast("Please fill in all fields", "error");
      return false;
    }

    if (formData.password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showToast("Account created successfully!", "success");
      router.push("/");
    } catch (error: any) {
      showToast(error.message || "Failed to create account", "error");
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#2C1810] mb-2"
            >
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full"
              disabled={loading}
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
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full"
              disabled={loading}
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
              onChange={handleInputChange}
              placeholder="Create a password (min. 8 characters)"
              className="w-full"
              disabled={loading}
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
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#C1502E] focus:ring-[#C1502E]"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-[#3E2723]">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#C1502E] hover:text-[#A0421F] font-medium"
                >
                  Terms of Service
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
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#3E2723]">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => showToast('Social registration coming soon!', 'info')}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => showToast('Social registration coming soon!', 'info')}
            >
              Facebook
            </Button>
          </div>
        </div> */}

        <div className="mt-6 text-center">
          <p className="text-sm text-[#3E2723]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#C1502E] hover:text-[#A0421F]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
