"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string | null;
  vendorId: number;
  vendorName: string;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form fields
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadCart();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      showToast("Please login to checkout", "error");
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "CUSTOMER") {
      showToast("Only customers can place orders", "error");
      router.push("/");
      return;
    }
  };

  const loadCart = () => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const items = JSON.parse(cart);
      if (items.length === 0) {
        router.push("/cart");
      }
      setCartItems(items);
    } else {
      router.push("/cart");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          vendorId: item.vendorId,
        })),
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingCountry,
        paymentMethod,
      };

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const order = await response.json();

      // Clear cart
      localStorage.removeItem("cart");

      showToast("Order placed successfully!");

      // Redirect to order confirmation
      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 1000);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to place order",
        "error"
      );
    } finally {
      setLoading(false);
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
          <button
            onClick={() => router.push("/cart")}
            className="text-[#8a7160] hover:text-[#181411] text-sm font-medium"
          >
            ← Back to Cart
          </button>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[#181411] text-3xl sm:text-4xl font-bold mb-8">
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Shipping Information */}
                  <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
                    <h2 className="text-[#181411] text-xl font-bold mb-4">
                      Shipping Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#181411] text-base font-medium mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          placeholder="123 Main Street"
                          className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d] focus:border-transparent"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#181411] text-base font-medium mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="New York"
                            className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d] focus:border-transparent"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[#181411] text-base font-medium mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            placeholder="10001"
                            className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d] focus:border-transparent"
                            value={shippingZip}
                            onChange={(e) => setShippingZip(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#181411] text-base font-medium mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          placeholder="United States"
                          className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d] focus:border-transparent"
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
                    <h2 className="text-[#181411] text-xl font-bold mb-4">
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border border-[#e6dfdb] rounded-lg cursor-pointer hover:bg-[#f5f2f0]">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-[#f2690d]"
                        />
                        <div className="flex-1">
                          <div className="text-[#181411] font-bold">
                            Cash on Delivery
                          </div>
                          <div className="text-[#8a7160] text-sm">
                            Pay when you receive your order
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-[#e6dfdb] rounded-lg cursor-pointer hover:bg-[#f5f2f0] opacity-50">
                        <input
                          type="radio"
                          name="payment"
                          value="stripe"
                          disabled
                          className="w-4 h-4 text-[#f2690d]"
                        />
                        <div className="flex-1">
                          <div className="text-[#181411] font-bold">
                            Credit/Debit Card
                          </div>
                          <div className="text-[#8a7160] text-sm">
                            Coming soon
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-[#f2690d] text-white text-lg font-bold rounded-lg hover:bg-[#d95a0a] transition-colors disabled:bg-[#e6dfdb] disabled:cursor-not-allowed"
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#f5f2f0] border border-[#e6dfdb] rounded-lg p-6 sticky top-4">
                  <h2 className="text-[#181411] text-xl font-bold mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-white rounded border border-[#e6dfdb] overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#181411] font-medium text-sm">
                            {item.name}
                          </p>
                          <p className="text-[#8a7160] text-xs">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-[#f2690d] font-bold text-sm">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#e6dfdb] pt-4 space-y-2">
                    <div className="flex justify-between text-[#8a7160]">
                      <span>Subtotal</span>
                      <span>Rs. {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#8a7160]">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-[#181411] font-bold text-xl pt-2">
                      <span>Total</span>
                      <span className="text-[#f2690d]">
                        Rs. {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
