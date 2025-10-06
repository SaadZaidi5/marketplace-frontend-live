"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const handleGetStarted = () => {
    if (user) {
      if (user.role === "vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/products");
      }
    } else {
      router.push("/signup");
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      {/* Header/Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f5f2f0] px-4 sm:px-10 py-3">
        <div className="flex items-center gap-4 text-[#181411]">
          <div
            className="w-4 h-4 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_6_319)">
                <path
                  d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_6_319">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h2
            className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer"
            onClick={() => router.push("/")}
          >
            NexBazaar
          </h2>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => router.push("/products")}
            className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
          >
            Browse Products
          </button>

          {user ? (
            <>
              {user.role === "vendor" && (
                <button
                  onClick={() => router.push("/vendor/dashboard")}
                  className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
                >
                  Dashboard
                </button>
              )}
              {user.role === "customer" && (
                <>
                  <button
                    onClick={() => router.push("/cart")}
                    className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
                  >
                    Cart
                  </button>
                  <button
                    onClick={() => router.push("/orders")}
                    className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
                  >
                    Orders
                  </button>
                </>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[#8a7160] text-sm">{user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-[#181411] border border-[#e6dfdb] rounded-lg hover:bg-[#f5f2f0] transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm font-medium text-[#181411] hover:text-[#f2690d] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 text-sm font-bold text-white bg-[#f2690d] rounded-lg hover:bg-[#d95a0a] transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content */}
            <div className="text-center mb-16">
              <h1 className="text-[#181411] text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Welcome to NexBazaar
              </h1>
              <p className="text-[#8a7160] text-lg sm:text-xl max-w-2xl mx-auto mb-8">
                Your marketplace for quality products. Buy from trusted vendors
                or start selling your own products today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-[#f2690d] text-white text-lg font-bold rounded-lg hover:bg-[#d95a0a] transition-colors"
                >
                  {user
                    ? user.role === "vendor"
                      ? "Go to Dashboard"
                      : "Start Shopping"
                    : "Get Started"}
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="px-8 py-4 border-2 border-[#e6dfdb] text-[#181411] text-lg font-bold rounded-lg hover:bg-[#f5f2f0] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-[#181411] text-xl font-bold mb-2">
                  Shop Quality Products
                </h3>
                <p className="text-[#8a7160]">
                  Browse thousands of products from verified vendors
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-[#181411] text-xl font-bold mb-2">
                  Become a Vendor
                </h3>
                <p className="text-[#8a7160]">
                  Start selling your products and reach customers worldwide
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-[#181411] text-xl font-bold mb-2">
                  Fast Delivery
                </h3>
                <p className="text-[#8a7160]">
                  Get your orders delivered quickly and securely
                </p>
              </div>
            </div>

            {/* CTA Section */}
            {!user && (
              <div className="bg-[#f5f2f0] rounded-lg p-8 sm:p-12 text-center mt-16">
                <h2 className="text-[#181411] text-2xl sm:text-3xl font-bold mb-4">
                  Ready to get started?
                </h2>
                <p className="text-[#8a7160] mb-6">
                  Join thousands of happy customers and vendors on NexBazaar
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-6 py-3 bg-[#f2690d] text-white font-bold rounded-lg hover:bg-[#d95a0a] transition-colors"
                  >
                    Sign Up as Customer
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-6 py-3 border border-[#e6dfdb] text-[#181411] font-bold rounded-lg hover:bg-white transition-colors"
                  >
                    Sign Up as Vendor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#f5f2f0] px-4 sm:px-10 py-6">
        <div className="max-w-6xl mx-auto text-center text-[#8a7160] text-sm">
          <p>&copy; 2025 NexBazaar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
