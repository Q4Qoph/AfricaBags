'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
    // You can add toast notification or API call here
  };

  return (
    <footer className="bg-[#3E2723] text-[#FAF6F1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-8 w-8 text-[#C1502E]" />
              <span className="text-xl font-bold text-[#FAF6F1]">AfricaBags</span>
            </Link>
            <p className="text-[#D4A574] mb-6 leading-relaxed">
              Authentic African bags crafted with traditional techniques and modern design.
              Celebrating the rich heritage and artistry of African craftsmanship.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-[#FAF6F1] font-semibold mb-4">Shop</h3>
            <nav className="space-y-3">
              <Link
                href="/shop"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                All Products
              </Link>
              <Link
                href="/new-arrivals"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                New Arrivals
              </Link>
              <Link
                href="/best-sellers"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Best Sellers
              </Link>
              <Link
                href="/categories/handbags"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Handbags
              </Link>
              <Link
                href="/categories/backpacks"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Backpacks
              </Link>
              <Link
                href="/categories/accessories"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Accessories
              </Link>
            </nav>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-[#FAF6F1] font-semibold mb-4">Support</h3>
            <nav className="space-y-3">
              <Link
                href="/about"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="/shipping"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Shipping Info
              </Link>
              <Link
                href="/returns"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Returns & Exchanges
              </Link>
              <Link
                href="/size-guide"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                Size Guide
              </Link>
              <Link
                href="/faq"
                className="block text-[#D4A574] hover:text-[#C1502E] transition-colors duration-200"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[#FAF6F1] font-semibold mb-4">Newsletter</h3>
            <p className="text-[#D4A574] mb-4 text-sm leading-relaxed">
              Subscribe to get special offers, free giveaways, and new product announcements.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-[#2C1810] border border-[#D4A574] rounded-md text-[#FAF6F1] placeholder-[#D4A574] focus:outline-none focus:ring-2 focus:ring-[#C1502E] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#C1502E] hover:bg-[#A0442A] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1502E] focus:ring-offset-2 focus:ring-offset-[#3E2723]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-[#2C1810]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-[#D4A574] text-sm">
              © {new Date().getFullYear()} AfricaBags. All rights reserved.
            </p>

            {/* Legal Links */}
            <nav className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-[#D4A574] hover:text-[#C1502E] text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[#D4A574] hover:text-[#C1502E] text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-[#D4A574] hover:text-[#C1502E] text-sm transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>

          {/* Payment Methods or Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-[#D4A574] text-sm">
              Secure payments • Fast shipping • Quality guaranteed
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}