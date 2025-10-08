"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
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

      showToast("Login successful!");

      // Route based on role (handle uppercase enums from backend)
      const role = data.user.role.toUpperCase();

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/products");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
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

      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f5f2f0] px-4 sm:px-10 py-3">
          <div className="flex items-center gap-4 text-[#181411]">
            <div className="w-4 h-4">
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
            <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
              NexBazaar
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col w-full max-w-[512px] py-5">
            <h2 className="text-[#181411] text-2xl sm:text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Welcome back
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#181411] text-base font-medium leading-normal pb-2">
                    Email
                  </p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181411] focus:outline-0 focus:ring-0 border border-[#e6dfdb] bg-white focus:border-[#e6dfdb] h-14 placeholder:text-[#8a7160] p-[15px] text-base font-normal leading-normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </label>
              </div>

              {/* Password Field */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#181411] text-base font-medium leading-normal pb-2">
                    Password
                  </p>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181411] focus:outline-0 focus:ring-0 border border-[#e6dfdb] bg-white focus:border-[#e6dfdb] h-14 placeholder:text-[#8a7160] p-[15px] text-base font-normal leading-normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </label>
              </div>

              {/* Forgot Password Link */}
              <p className="text-[#8a7160] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer hover:text-[#181411]">
                <a href="/forgot-password">Forgot Password?</a>
              </p>

              {/* Login Button */}
              <div className="flex px-4 py-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#f2690d] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#d95a0a] disabled:bg-[#e6dfdb] disabled:cursor-not-allowed transition-colors"
                >
                  <span className="truncate">
                    {isLoading ? "Logging in..." : "Login"}
                  </span>
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="text-[#8a7160] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
                Don't have an account?{" "}
                <a href="/signup" className="underline hover:text-[#181411]">
                  Sign up
                </a>
              </p>
            </form>
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
    </div>
  );
}
