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

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
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
            className="text-[#181411] text-lg font-bold"
            onClick={() => router.push("/")}
          >
            NexBazaar Admin
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#8a7160] text-sm">{user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-[#181411] border border-[#e6dfdb] rounded-lg hover:bg-[#f5f2f0]"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#f5f2f0] p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === "dashboard"
                  ? "bg-[#f2690d] text-white"
                  : "text-[#181411] hover:bg-[#f5f2f0]"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === "users"
                  ? "bg-[#f2690d] text-white"
                  : "text-[#181411] hover:bg-[#f5f2f0]"
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === "products"
                  ? "bg-[#f2690d] text-white"
                  : "text-[#181411] hover:bg-[#f5f2f0]"
              }`}
            >
              📦 Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === "orders"
                  ? "bg-[#f2690d] text-white"
                  : "text-[#181411] hover:bg-[#f5f2f0]"
              }`}
            >
              🛒 Orders
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === "logs"
                  ? "bg-[#f2690d] text-white"
                  : "text-[#181411] hover:bg-[#f5f2f0]"
              }`}
            >
              📝 Activity Logs
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin text-4xl">⏳</div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && stats && (
                <div>
                  <h1 className="text-3xl font-bold text-[#181411] mb-8">
                    Dashboard Overview
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="text-4xl mb-2">👥</div>
                      <div className="text-2xl font-bold text-[#181411]">
                        {stats.totalUsers}
                      </div>
                      <div className="text-sm text-[#8a7160]">Total Users</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-4xl mb-2">📦</div>
                      <div className="text-2xl font-bold text-[#181411]">
                        {stats.totalProducts}
                      </div>
                      <div className="text-sm text-[#8a7160]">
                        Total Products
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <div className="text-4xl mb-2">🛒</div>
                      <div className="text-2xl font-bold text-[#181411]">
                        {stats.totalOrders}
                      </div>
                      <div className="text-sm text-[#8a7160]">Total Orders</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-[#f2690d]">
                        ${(stats.totalRevenue || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-[#8a7160]">
                        Total Revenue
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#181411] mb-4">
                        Users by Role
                      </h3>
                      {(stats.usersByRole || []).map((item) => (
                        <div
                          key={item.role}
                          className="flex justify-between py-2 border-b border-[#e6dfdb]"
                        >
                          <span className="text-[#181411]">{item.role}</span>
                          <span className="font-bold text-[#f2690d]">
                            {item._count}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#181411] mb-4">
                        Orders by Status
                      </h3>
                      {(stats.ordersByStatus || []).map((item) => (
                        <div
                          key={item.status}
                          className="flex justify-between py-2 border-b border-[#e6dfdb]"
                        >
                          <span className="text-[#181411]">{item.status}</span>
                          <span className="font-bold text-[#f2690d]">
                            {item._count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === "users" && (
                <div>
                  <h1 className="text-3xl font-bold text-[#181411] mb-8">
                    User Management
                  </h1>
                  <div className="bg-white border border-[#e6dfdb] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#f5f2f0]">
                        <tr>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Name
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Email
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Role
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Status
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Products/Orders
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(users || []).map((user) => (
                          <tr
                            key={user.id}
                            className="border-t border-[#e6dfdb]"
                          >
                            <td className="p-4 text-[#181411]">
                              {user.fullName}
                            </td>
                            <td className="p-4 text-[#8a7160]">{user.email}</td>
                            <td className="p-4">
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  updateUserRole(user.id, e.target.value)
                                }
                                className="px-2 py-1 border border-[#e6dfdb] rounded"
                              >
                                <option value="CUSTOMER">CUSTOMER</option>
                                <option value="VENDOR">VENDOR</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                value={user.status}
                                onChange={(e) =>
                                  updateUserStatus(user.id, e.target.value)
                                }
                                className="px-2 py-1 border border-[#e6dfdb] rounded"
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                                <option value="BANNED">BANNED</option>
                              </select>
                            </td>
                            <td className="p-4 text-[#8a7160]">
                              {user._count.products} /{" "}
                              {user._count.customerOrders}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
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
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div>
                  <h1 className="text-3xl font-bold text-[#181411] mb-8">
                    Product Management
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(products || []).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border border-[#e6dfdb] rounded-lg p-4"
                      >
                        <div className="w-full h-48 bg-[#f5f2f0] rounded-lg mb-3 flex items-center justify-center">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-6xl">📦</div>
                          )}
                        </div>
                        <h3 className="text-[#181411] font-bold mb-2">
                          {product.name}
                        </h3>
                        <p className="text-[#8a7160] text-sm mb-2">
                          by {product.vendor.fullName}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[#f2690d] font-bold">
                            ${product.price}
                          </span>
                          <span className="text-[#8a7160] text-sm">
                            Stock: {product.stock}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete Product
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div>
                  <h1 className="text-3xl font-bold text-[#181411] mb-8">
                    Order Management
                  </h1>
                  <div className="space-y-4">
                    {(orders || []).map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-[#e6dfdb] rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-[#181411] font-bold">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-[#8a7160] text-sm">
                              {order.customer.fullName} - {order.customer.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-[#f2690d] font-bold text-xl">
                              ${order.totalAmount.toFixed(2)}
                            </div>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value)
                              }
                              className="mt-2 px-3 py-1 border border-[#e6dfdb] rounded"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                        </div>
                        <div className="text-sm text-[#8a7160]">
                          {order.items.length} items -{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs */}
              {activeTab === "logs" && (
                <div>
                  <h1 className="text-3xl font-bold text-[#181411] mb-8">
                    Activity Logs
                  </h1>
                  <div className="bg-white border border-[#e6dfdb] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#f5f2f0]">
                        <tr>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Date
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Admin
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Action
                          </th>
                          <th className="text-left p-4 text-[#181411] font-bold">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(logs || []).map((log) => (
                          <tr
                            key={log.id}
                            className="border-t border-[#e6dfdb]"
                          >
                            <td className="p-4 text-[#8a7160] text-sm">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 text-[#181411]">
                              {log.admin.fullName}
                            </td>
                            <td className="p-4 text-[#f2690d] font-medium">
                              {log.action}
                            </td>
                            <td className="p-4 text-[#8a7160]">
                              {log.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
