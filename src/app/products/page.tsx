"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProductImage {
  id: number;
  url: string;
  productId: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  vendorId: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  vendor?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "stock":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

  const getStockDisplay = (stock: number) => {
    if (stock > 10)
      return { text: "In stock", class: "bg-green-100 text-green-800" };
    if (stock > 0)
      return {
        text: `${stock} in stock`,
        class: "bg-yellow-100 text-yellow-800",
      };
    return { text: "Out of stock", class: "bg-red-100 text-red-800" };
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
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
                  {user.role === "CUSTOMER" && (
                    <>
                      <button
                        onClick={() => router.push("/cart")}
                        className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cart
                      </button>
                      <button
                        onClick={() => router.push("/orders")}
                        className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Orders
                      </button>
                    </>
                  )}
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
                Browse Products
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Discover amazing products from our trusted vendors
              </p>
            </div>
            {user?.role === "VENDOR" && (
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => router.push("/vendor/dashboard")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Add New Product
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {products.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        In Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {products.filter((p) => p.stock > 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Vendors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {new Set(products.map((p) => p.vendorId)).size}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white shadow rounded-lg text-center py-20">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "No products match your search criteria. Try different keywords."
                : "No products are currently available."}
            </p>
            {searchQuery && (
              <div className="mt-6">
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const stockInfo = getStockDisplay(product.stock);

              return (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
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

                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.class}`}
                      >
                        {stockInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Vendor Info */}
                    {product.vendor && (
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-orange-600 text-xs font-medium">
                            {product.vendor.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          by {product.vendor.fullName}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        Rs. {product.price.toFixed(2)}
                      </span>

                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${product.slug}`);
                        }}
                      >
                        {product.stock > 0 ? "View Details" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
