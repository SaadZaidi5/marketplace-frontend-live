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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = localStorage.getItem("cart");
      if (cart) {
        setCartItems(JSON.parse(cart));
      }
    } catch (error) {
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (itemId: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    updateCart(updatedCart);
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    updateCart([]);
    showToast("Cart cleared");
  };

  const calculateSubtotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateSubtotal(item),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#8a7160]">Loading cart...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push("/products")}
            className="text-[#8a7160] hover:text-[#181411] text-sm font-medium"
          >
            Continue Shopping
          </button>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[#181411] text-3xl sm:text-4xl font-bold mb-8">
              Shopping Cart
            </h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-[#181411] text-2xl font-bold mb-2">
                  Your cart is empty
                </h2>
                <p className="text-[#8a7160] mb-6">
                  Add some products to get started!
                </p>
                <button
                  onClick={() => router.push("/products")}
                  className="px-6 py-3 bg-[#f2690d] text-white font-bold rounded-lg hover:bg-[#d95a0a] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#e6dfdb] rounded-lg p-4 flex gap-4"
                    >
                      {/* Product Image */}
                      <div
                        className="w-24 h-24 bg-[#f5f2f0] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => router.push(`/products/${item.slug}`)}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3
                            className="text-[#181411] font-bold text-lg mb-1 cursor-pointer hover:text-[#f2690d]"
                            onClick={() =>
                              router.push(`/products/${item.slug}`)
                            }
                          >
                            {item.name}
                          </h3>
                          <p className="text-[#8a7160] text-sm">
                            by {item.vendorName}
                          </p>
                          <p className="text-[#f2690d] font-bold text-lg mt-2">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 border border-[#e6dfdb] rounded flex items-center justify-center text-[#181411] font-bold hover:bg-[#f5f2f0]"
                            >
                              −
                            </button>
                            <span className="w-12 text-center text-[#181411] font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 border border-[#e6dfdb] rounded flex items-center justify-center text-[#181411] font-bold hover:bg-[#f5f2f0]"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 text-sm font-medium hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-[#8a7160] text-sm">Subtotal</p>
                        <p className="text-[#181411] font-bold text-xl">
                          ${calculateSubtotal(item).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Clear Cart Button */}
                  <button
                    onClick={clearCart}
                    className="text-[#8a7160] text-sm font-medium hover:text-red-600"
                  >
                    Clear entire cart
                  </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-[#f5f2f0] border border-[#e6dfdb] rounded-lg p-6 sticky top-4">
                    <h2 className="text-[#181411] text-xl font-bold mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-[#8a7160]">
                        <span>Items ({cartItems.length})</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#8a7160]">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="border-t border-[#e6dfdb] pt-3 flex justify-between text-[#181411] font-bold text-xl">
                        <span>Total</span>
                        <span className="text-[#f2690d]">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/checkout")}
                      className="w-full py-3 px-6 bg-[#f2690d] text-white font-bold rounded-lg hover:bg-[#d95a0a] transition-colors mb-3"
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      onClick={() => router.push("/products")}
                      className="w-full py-3 px-6 border border-[#e6dfdb] text-[#181411] font-medium rounded-lg hover:bg-white transition-colors"
                    >
                      Continue Shopping
                    </button>

                    {/* Additional Info */}
                    <div className="mt-6 text-sm text-[#8a7160] space-y-2">
                      <p>✓ Secure checkout</p>
                      <p>✓ Easy returns</p>
                      <p>✓ Fast delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
