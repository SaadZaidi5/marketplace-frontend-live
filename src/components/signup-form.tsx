"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (!role) {
      showToast("Please select your role", "error");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned an invalid response. Please check if the backend is running."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showToast("Account created successfully!");

      // Route based on role (handle uppercase enums from backend)
      const userRole = data.user.role.toUpperCase();

      if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userRole === "VENDOR") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/products");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to create account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Layout */}
      <div
        className="hidden lg:flex fixed inset-0 w-screen h-screen items-center"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 px-6 py-4 rounded-lg shadow-lg z-50 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white animate-slideIn`}
          >
            {toast.message}
          </div>
        )}

        {/* Left Panel - Branding with Dot Pattern */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900 relative">
          {/* Dot Pattern Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #334155 1px, transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          ></div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900"></div>

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center items-center gap-3">
              <svg
                className="h-12 w-12 text-blue-500"
                fill="none"
                viewBox="0 0 48 48"
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
                    <rect fill="white" height="48" width="48" />
                  </clipPath>
                </defs>
              </svg>
              <h1 className="text-5xl font-extrabold text-white">NexBazaar</h1>
            </div>
            <p className="text-lg text-gray-400">
              Your one-stop shop for everything
            </p>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-1/2 h-full flex items-center justify-center p-12 bg-gray-900 overflow-y-auto">
          <div className="w-full max-w-md space-y-6 my-auto">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Create an Account
              </h2>
              <p className="mt-2 text-base text-gray-400">
                Join our marketplace and start your journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label htmlFor="full-name" className="sr-only">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full-name"
                  name="full-name"
                  placeholder="Full Name"
                  className="relative block w-full appearance-none rounded-lg border border-gray-700 px-4 py-3 bg-gray-800 placeholder-gray-500 text-white focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email-address"
                  name="email"
                  autoComplete="email"
                  placeholder="Email address"
                  className="relative block w-full appearance-none rounded-lg border border-gray-700 px-4 py-3 bg-gray-800 placeholder-gray-500 text-white focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  className="relative block w-full appearance-none rounded-lg border border-gray-700 px-4 py-3 bg-gray-800 placeholder-gray-500 text-white focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  className="relative block w-full appearance-none rounded-lg border border-gray-700 px-4 py-3 bg-gray-800 placeholder-gray-500 text-white focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Account Type Select */}
              <div>
                <label htmlFor="account-type" className="sr-only">
                  Account Type
                </label>
                <select
                  id="account-type"
                  name="account-type"
                  className="relative block w-full appearance-none rounded-lg border border-gray-700 px-4 py-3 bg-gray-800 text-white focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="" className="text-gray-500">
                    Select account type
                  </option>
                  <option value="customer" className="text-white">
                    Customer
                  </option>
                  <option value="vendor" className="text-white">
                    Vendor
                  </option>
                </select>
              </div>

              {/* Sign Up Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-3 px-4 text-base font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 ease-in-out disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <a
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Already have an account? Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div
        className="lg:hidden fixed inset-0 w-screen h-screen bg-gray-900 overflow-y-auto"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 left-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white animate-slideIn text-sm`}
          >
            {toast.message}
          </div>
        )}

        {/* Mobile Header with Logo */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_signup_mobile)">
                <path
                  d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_signup_mobile">
                  <rect fill="white" height="48" width="48" />
                </clipPath>
              </defs>
            </svg>
            <h1 className="text-2xl font-bold text-white">NexBazaar</h1>
          </div>
          <p className="text-blue-100 text-sm">Join our marketplace today</p>
        </div>

        {/* Mobile Form */}
        <div className="p-6 pb-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="full-name-mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="full-name-mobile"
                  name="full-name"
                  placeholder="John Doe"
                  className="form-input block w-full rounded-lg border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-blue-500 p-3 placeholder-gray-500 text-white transition text-base"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email-mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-mobile"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-input block w-full rounded-lg border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-blue-500 p-3 placeholder-gray-500 text-white transition text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password-mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password-mobile"
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="form-input block w-full rounded-lg border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-blue-500 p-3 placeholder-gray-500 text-white transition text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirm-password-mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password-mobile"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="form-input block w-full rounded-lg border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-blue-500 p-3 placeholder-gray-500 text-white transition text-base"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Account Type Select */}
              <div>
                <label
                  htmlFor="account-type-mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Account Type
                </label>
                <select
                  id="account-type-mobile"
                  name="account-type"
                  className="form-input block w-full rounded-lg border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-blue-500 p-3 text-white transition text-base"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select account type</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
