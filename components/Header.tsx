"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useWishlist } from "@/lib/api"; // Your React Query hooks

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  // Real cart count from API
  const { data: cartSummary } = useCart.summary();
  const cartCount = cartSummary?.itemCount || 0;

  // Real wishlist count from API
  const { data: wishlistData } = useWishlist.get();
  const wishlistCount = wishlistData?.wishlist?.length || 0;

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F1] shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-[#C1502E]" />
            <span className="text-xl font-bold text-[#3E2723]">AfricaBags</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className="text-[#3E2723] hover:text-[#C1502E] font-medium transition-colors duration-200"
            >
              Shop
            </Link>
            <Link
              href="/new-arrivals"
              className="text-[#3E2723] hover:text-[#C1502E] font-medium transition-colors duration-200"
            >
              New Arrivals
            </Link>
            <Link
              href="/best-sellers"
              className="text-[#3E2723] hover:text-[#C1502E] font-medium transition-colors duration-200"
            >
              Best Sellers
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button
              className="p-2 text-[#3E2723] hover:text-[#C1502E] transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist with Count */}
            <Link
              href="/wishlist"
              className="relative p-2 text-[#3E2723] hover:text-[#C1502E] transition-colors duration-200"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1502E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with Count */}
            <Link
              href="/cart"
              className="relative p-2 text-[#3E2723] hover:text-[#C1502E] transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1502E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-1 p-2 text-[#3E2723] hover:text-[#C1502E] transition-colors duration-200 rounded-full hover:bg-[#FAF6F1]/50"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-3 px-4 bg-[#FAF6F1] border-b">
                      <p className="text-sm font-medium text-[#3E2723]">Hello,</p>
                      <p className="text-base font-semibold text-[#2C1810]">{user.name}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#FAF6F1] transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#FAF6F1] transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm font-medium text-[#C1502E] hover:bg-[#FAF6F1] transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#3E2723] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#C1502E] hover:bg-[#A0442A] text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-[#3E2723] hover:text-[#C1502E] transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#D4A574] bg-[#FAF6F1]">
            <div className="px-4 pt-4 pb-3 space-y-1">
              <Link
                href="/shop"
                className="block px-4 py-3 text-[#3E2723] hover:text-[#C1502E] hover:bg-white/50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/new-arrivals"
                className="block px-4 py-3 text-[#3E2723] hover:text-[#C1502E] hover:bg-white/50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                href="/best-sellers"
                className="block px-4 py-3 text-[#3E2723] hover:text-[#C1502E] hover:bg-white/50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Best Sellers
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="border-t border-[#D4A574] px-4 pt-4 pb-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <button className="flex flex-col items-center text-[#3E2723] hover:text-[#C1502E]">
                  <Search className="h-6 w-6 mb-1" />
                  <span className="text-xs">Search</span>
                </button>

                <Link
                  href="/wishlist"
                  className="flex flex-col items-center text-[#3E2723] hover:text-[#C1502E] relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-6 w-6 mb-1" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#C1502E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                  <span className="text-xs">Wishlist</span>
                </Link>

                <Link
                  href="/cart"
                  className="flex flex-col items-center text-[#3E2723] hover:text-[#C1502E] relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-6 w-6 mb-1" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#C1502E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                  <span className="text-xs">Cart</span>
                </Link>

                {user ? (
                  <Link
                    href="/profile"
                    className="flex flex-col items-center text-[#3E2723] hover:text-[#C1502E]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-6 w-6 mb-1" />
                    <span className="text-xs">Profile</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex flex-col items-center text-[#3E2723] hover:text-[#C1502E]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-6 w-6 mb-1" />
                    <span className="text-xs">Login</span>
                  </Link>
                )}
              </div>

              {/* Mobile User Section */}
              {user && (
                <div className="mt-6 pt-6 border-t border-[#D4A574]">
                  <p className="px-4 text-sm font-medium text-[#3E2723] mb-3">
                    Hello, {user.name}
                  </p>
                  <Link
                    href="/orders"
                    className="block px-4 py-3 text-[#3E2723] hover:text-[#C1502E] hover:bg-white/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-[#C1502E] font-medium hover:bg-white/50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}