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
  slug?: string;
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
    setUser(null);
    router.push("/");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
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
          <div className="flex gap-2">
            {user ? (
              <>
                {user.role === "VENDOR" && (
                  <button
                    onClick={() => router.push("/vendor/dashboard")}
                    className="px-4 py-2 text-sm font-medium text-[#181411] hover:text-[#f2690d] transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                {user.role === "CUSTOMER" && (
                  <>
                    <button
                      onClick={() => router.push("/cart")}
                      className="px-4 py-2 text-sm font-medium text-[#181411] hover:text-[#f2690d] transition-colors"
                    >
                      Cart
                    </button>
                    <button
                      onClick={() => router.push("/orders")}
                      className="px-4 py-2 text-sm font-medium text-[#181411] hover:text-[#f2690d] transition-colors"
                    >
                      Orders
                    </button>
                  </>
                )}
                <div className="flex items-center gap-3 border-l border-[#e6dfdb] pl-4 ml-2">
                  <span className="text-[#8a7160] text-sm">
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-[#181411] border border-[#e6dfdb] rounded-lg hover:bg-[#f5f2f0] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-8">
          {/* Page Title and Search */}
          <div className="max-w-7xl mx-auto mb-8">
            <h1 className="text-[#181411] text-3xl sm:text-4xl font-bold mb-2">
              Browse Products
            </h1>
            <p className="text-[#8a7160] text-base mb-6">
              Discover amazing products from our vendors
            </p>

            {/* Search Bar */}
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-[#8a7160]">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-[#8a7160] text-lg">
                  {searchQuery
                    ? "No products found matching your search"
                    : "No products available yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-[#e6dfdb] rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/products/${product.slug}`)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-[#f5f2f0] flex items-center justify-center overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl">📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-[#181411] font-bold text-lg mb-1 truncate">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-[#8a7160] text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#f2690d] font-bold text-xl">
                          Rs. {product.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>

                      {product.vendor && (
                        <p className="text-[#8a7160] text-xs mb-3">
                          by {product.vendor.fullName}
                        </p>
                      )}

                      <button
                        className="w-full py-2 px-4 bg-[#f2690d] text-white text-sm font-bold rounded-lg hover:bg-[#d95a0a] transition-colors disabled:bg-[#e6dfdb] disabled:cursor-not-allowed"
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
