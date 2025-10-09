"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  usersByRole: Array<{ role: string; _count: number }>;
  ordersByStatus: Array<{ status: string; _count: number }>;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  _count: {
    products: number;
    customerOrders: number;
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  vendor: {
    id: number;
    fullName: string;
    email: string;
  };
  images: Array<{ url: string }>;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer: {
    id: number;
    fullName: string;
    email: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

interface AdminLog {
  id: number;
  action: string;
  targetType: string;
  targetId: number;
  description: string;
  createdAt: string;
  admin: {
    fullName: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "products" | "orders" | "logs"
  >("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<any>(null);
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
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadData();
    }
  }, [activeTab, user]);

  const checkAuth = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(userData);
    if (parsed.role !== "ADMIN") {
      showToast("Admin access required", "error");
      router.push("/");
      return;
    }
    setUser(parsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      if (activeTab === "dashboard") {
        const res = await fetch(`${apiUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } else if (activeTab === "users") {
        const res = await fetch(`${apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data);
      } else if (activeTab === "products") {
        const res = await fetch(`${apiUrl}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProducts(data);
      } else if (activeTab === "orders") {
        const res = await fetch(`${apiUrl}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data);
      } else if (activeTab === "logs") {
        const res = await fetch(`${apiUrl}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast("User status updated");
        loadData();
      }
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        showToast("User role updated");
        loadData();
      }
    } catch (error) {
      showToast("Failed to update role", "error");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("User deleted");
        loadData();
      }
    } catch (error) {
      showToast("Failed to delete user", "error");
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Product deleted");
        loadData();
      }
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast("Order status updated");
        loadData();
      }
    } catch (error) {
      showToast("Failed to update order", "error");
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
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "banned":
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                  NexBazaar Admin
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-medium">
                    {user?.fullName
                      ?.split(" ")
                      .map((n: string) => n[0])
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
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "dashboard"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "users"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span className="font-medium">Users</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "products"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span className="font-medium">Products</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "orders"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="font-medium">Orders</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "logs"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">Activity Logs</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && stats && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dashboard Overview
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Monitor your platform performance and statistics
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">
                            Total Users
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalUsers}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">
                            Total Products
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalProducts}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                          <svg
                            className="w-6 h-6 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">
                            Total Orders
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalOrders}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                          <svg
                            className="w-6 h-6 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">
                            Total Revenue
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            Rs. {(stats.totalRevenue || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Users by Role
                      </h3>
                      <div className="space-y-3">
                        {(stats.usersByRole || []).map((item) => (
                          <div
                            key={item.role}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {item.role}
                            </span>
                            <span className="text-lg font-bold text-orange-600">
                              {item._count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Orders by Status
                      </h3>
                      <div className="space-y-3">
                        {(stats.ordersByStatus || []).map((item) => (
                          <div
                            key={item.status}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {item.status}
                            </span>
                            <span className="text-lg font-bold text-orange-600">
                              {item._count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === "users" && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                      User Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage user accounts, roles, and status
                    </p>
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Metrics
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(users || []).map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) =>
                                    updateUserRole(user.id, e.target.value)
                                  }
                                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                                >
                                  <option value="CUSTOMER">CUSTOMER</option>
                                  <option value="VENDOR">VENDOR</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.status}
                                  onChange={(e) =>
                                    updateUserStatus(user.id, e.target.value)
                                  }
                                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                                >
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="SUSPENDED">SUSPENDED</option>
                                  <option value="BANNED">BANNED</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user._count.products} Products /{" "}
                                {user._count.customerOrders} Orders
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Product Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage products and inventory
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(products || []).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white shadow rounded-lg overflow-hidden"
                      >
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg
                                className="w-12 h-12 text-gray-400"
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
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            by {product.vendor.fullName}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-orange-600">
                              Rs. {product.price}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.stock > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.stock} in stock
                            </span>
                          </div>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Order Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Monitor and manage customer orders
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(orders || []).map((order) => (
                      <div
                        key={order.id}
                        className="bg-white shadow rounded-lg p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {order.customer.fullName} • {order.customer.email}
                            </p>
                          </div>
                          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-xl font-bold text-orange-600">
                              Rs. {order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">
                            {order.items.length} items •{" "}
                            {formatDate(order.createdAt)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {item.product.name} (x{item.quantity})
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value)
                            }
                            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs */}
              {activeTab === "logs" && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Activity Logs
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Monitor admin activities and system events
                    </p>
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(logs || []).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(log.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {log.admin.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {log.admin.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {log.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
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
