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
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
    if (userData.role !== "CUSTOMER") {
      showToast("Only customers can view order history", "error");
      router.push("/");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/orders/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log("Fetched orders:", data); // Debug log
      setOrders(data);
    } catch (error) {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(
        (order) => order.status.toLowerCase() === "pending"
      ).length,
      confirmed: orders.filter(
        (order) => order.status.toLowerCase() === "confirmed"
      ).length,
      shipped: orders.filter(
        (order) => order.status.toLowerCase() === "shipped"
      ).length,
      delivered: orders.filter(
        (order) => order.status.toLowerCase() === "delivered"
      ).length,
      cancelled: orders.filter(
        (order) => order.status.toLowerCase() === "cancelled"
      ).length,
    };
    console.log("Status counts:", counts); // Debug log
    return counts;
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filterStatus);

  console.log("Filtered orders:", filteredOrders, "with filter:", filterStatus); // Debug log

  const statusCounts = getStatusCounts();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
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

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div
                  className="w-8 h-8 text-orange-600 cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  <svg viewBox="0 0 48 48" fill="currentColor">
                    <g clipPath="url(#clip0_6_319)">
                      <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" />
                    </g>
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  NexBazaar
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/products")}
                className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </button>

              {user ? (
                <>
                  {user.role === "VENDOR" && (
                    <button
                      onClick={() => router.push("/vendor/dashboard")}
                      className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Vendor Dashboard
                    </button>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium">
                        {user?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="hidden sm:block">{user?.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order History
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage your recent purchases
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push("/products")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                key: "all",
                label: "All Orders",
                count: statusCounts.all,
                color: "gray",
              },
              {
                key: "pending",
                label: "Pending",
                count: statusCounts.pending,
                color: "yellow",
              },
              {
                key: "confirmed",
                label: "Confirmed",
                count: statusCounts.confirmed,
                color: "blue",
              },
              {
                key: "shipped",
                label: "Shipped",
                count: statusCounts.shipped,
                color: "purple",
              },
              {
                key: "delivered",
                label: "Delivered",
                count: statusCounts.delivered,
                color: "green",
              },
              {
                key: "cancelled",
                label: "Cancelled",
                count: statusCounts.cancelled,
                color: "red",
              },
            ].map((stat) => (
              <div
                key={stat.key}
                className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all ${
                  filterStatus === stat.key ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => {
                  console.log("Setting filter to:", stat.key); // Debug log
                  setFilterStatus(stat.key);
                }}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 rounded-md p-3 ${
                        stat.color === "yellow"
                          ? "bg-yellow-100"
                          : stat.color === "blue"
                          ? "bg-blue-100"
                          : stat.color === "purple"
                          ? "bg-purple-100"
                          : stat.color === "green"
                          ? "bg-green-100"
                          : stat.color === "red"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`h-6 w-6 ${
                          stat.color === "yellow"
                            ? "text-yellow-600"
                            : stat.color === "blue"
                            ? "text-blue-600"
                            : stat.color === "purple"
                            ? "text-purple-600"
                            : stat.color === "green"
                            ? "text-green-600"
                            : stat.color === "red"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.key === "all" && "📦"}
                        {stat.key === "pending" && "⏳"}
                        {stat.key === "confirmed" && "✅"}
                        {stat.key === "shipped" && "🚚"}
                        {stat.key === "delivered" && "🎉"}
                        {stat.key === "cancelled" && "❌"}
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.label}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {filterStatus === "all"
                ? "All Orders"
                : `${
                    filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                  } Orders`}
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({filteredOrders.length})
              </span>
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterStatus === "all"
                  ? "Get started by placing your first order."
                  : `No ${filterStatus} orders at the moment.`}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/products")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm text-gray-500">Placed on</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-bold text-orange-600">
                          Rs. {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              Rs. {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-gray-500">
                      Payment:{" "}
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Card"}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {order.status.toLowerCase() === "delivered" && (
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-orange-600 bg-orange-100 hover:bg-orange-200">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
