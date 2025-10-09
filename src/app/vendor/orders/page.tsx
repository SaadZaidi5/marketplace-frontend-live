"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      id: number;
      url: string;
    }>;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  customer: {
    id: number;
    fullName: string;
    email: string;
  };
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "VENDOR") {
      showToast("Only vendors can view orders", "error");
      router.push("/");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/orders/vendor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );

      showToast("Order status updated successfully!");
    } catch (error) {
      showToast("Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateVendorTotal = (order: Order) => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#8a7160]">Loading orders...</p>
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
            onClick={() => router.push("/vendor/dashboard")}
            className="text-[#8a7160] hover:text-[#181411] text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[#181411] text-3xl sm:text-4xl font-bold mb-8">
              Orders Management
            </h1>

            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-[#181411] text-2xl font-bold mb-2">
                  No orders yet
                </h2>
                <p className="text-[#8a7160] mb-6">
                  Orders containing your products will appear here
                </p>
                <button
                  onClick={() => router.push("/vendor/dashboard")}
                  className="px-6 py-3 bg-[#f2690d] text-white font-bold rounded-lg hover:bg-[#d95a0a] transition-colors"
                >
                  Manage Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-[#e6dfdb] rounded-lg overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-[#f5f2f0] px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <div>
                          <p className="text-[#8a7160] text-sm">
                            Order placed: {formatDate(order.createdAt)}
                          </p>
                          <p className="text-[#181411] font-bold">
                            Order #{order.orderNumber}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <p className="text-[#8a7160] text-sm">
                          Customer: {order.customer.fullName}
                        </p>
                        <span className="text-[#8a7160]">•</span>
                        <p className="text-[#8a7160] text-sm">
                          {order.customer.email}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <h3 className="text-[#181411] font-bold mb-4">
                        Your Products in this Order
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 pb-4 border-b border-[#e6dfdb] last:border-0"
                          >
                            <div
                              className="w-20 h-20 bg-[#f5f2f0] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                              onClick={() =>
                                router.push(`/products/${item.product.slug}`)
                              }
                            >
                              {item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                  📦
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4
                                className="text-[#181411] font-bold cursor-pointer hover:text-[#f2690d]"
                                onClick={() =>
                                  router.push(`/products/${item.product.slug}`)
                                }
                              >
                                {item.product.name}
                              </h4>
                              <p className="text-[#8a7160] text-sm mt-1">
                                Quantity: {item.quantity} × Rs.{" "}
                                {item.price.toFixed(2)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[#f2690d] font-bold">
                                Rs. {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#e6dfdb] flex justify-between items-center">
                        <span className="text-[#181411] font-bold">
                          Your Total
                        </span>
                        <span className="text-[#f2690d] font-bold text-xl">
                          Rs. {calculateVendorTotal(order).toFixed(2)}
                        </span>
                      </div>

                      {/* Shipping Info */}
                      <div className="mt-4 pt-4 border-t border-[#e6dfdb]">
                        <h4 className="text-[#181411] font-bold mb-2">
                          Shipping Address
                        </h4>
                        <p className="text-[#8a7160] text-sm leading-relaxed">
                          {order.shippingAddress}
                          <br />
                          {order.shippingCity}, {order.shippingZip}
                          <br />
                          {order.shippingCountry}
                        </p>
                      </div>

                      {/* Status Update */}
                      <div className="mt-6 pt-4 border-t border-[#e6dfdb]">
                        <label className="block text-[#181411] font-bold mb-2">
                          Update Order Status
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-4 py-2 border border-[#e6dfdb] rounded-lg text-[#181411] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value)
                            }
                            disabled={updatingOrderId === order.id}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updatingOrderId === order.id && (
                            <div className="flex items-center px-4">
                              <div className="animate-spin text-xl">⏳</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Full Order */}
                      <div className="mt-4">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-[#f2690d] text-sm font-medium hover:underline"
                        >
                          View Full Order Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
