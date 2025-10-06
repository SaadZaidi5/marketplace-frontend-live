"use client";

import { useState, useEffect, use } from "react";
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
  vendor: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface ProductDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
    fetchProduct();
  }, [resolvedParams.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/products/slug/${resolvedParams.slug}`
      );

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      showToast("Failed to load product", "error");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Get existing cart from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(
      (item: any) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cartItems.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity: quantity,
        image: product.images[0]?.url || null,
        vendorId: product.vendorId,
        vendorName: product.vendor.fullName,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    showToast(`Added ${quantity} item(s) to cart!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#8a7160]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
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
            ← Back to Products
          </button>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-10 lg:px-20 xl:px-40 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-[#f5f2f0] rounded-lg overflow-hidden border border-[#e6dfdb]">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`aspect-square bg-[#f5f2f0] rounded-lg overflow-hidden border-2 cursor-pointer ${
                          selectedImage === index
                            ? "border-[#f2690d]"
                            : "border-[#e6dfdb]"
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="text-sm text-[#8a7160]">
                  <span
                    className="cursor-pointer hover:text-[#181411]"
                    onClick={() => router.push("/products")}
                  >
                    Products
                  </span>
                  <span className="mx-2">/</span>
                  <span className="text-[#181411]">{product.name}</span>
                </div>

                {/* Product Name */}
                <h1 className="text-[#181411] text-3xl sm:text-4xl font-bold">
                  {product.name}
                </h1>

                {/* Price and Stock */}
                <div className="flex items-center gap-4">
                  <span className="text-[#f2690d] text-3xl font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
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

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-[#181411] text-lg font-bold mb-2">
                      Description
                    </h3>
                    <p className="text-[#8a7160] leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Vendor Info */}
                <div className="border border-[#e6dfdb] rounded-lg p-4 bg-[#f5f2f0]">
                  <h3 className="text-[#181411] font-bold mb-1">Sold by</h3>
                  <p className="text-[#8a7160]">{product.vendor.fullName}</p>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div>
                    <label className="block text-[#181411] font-medium mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-[#e6dfdb] rounded-lg flex items-center justify-center text-[#181411] font-bold hover:bg-[#f5f2f0]"
                      >
                        −
                      </button>
                      <span className="w-16 text-center text-[#181411] font-bold">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="w-10 h-10 border border-[#e6dfdb] rounded-lg flex items-center justify-center text-[#181411] font-bold hover:bg-[#f5f2f0]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 px-6 bg-[#f2690d] text-white text-base font-bold rounded-lg hover:bg-[#d95a0a] transition-colors disabled:bg-[#e6dfdb] disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                {/* Additional Info */}
                <div className="text-sm text-[#8a7160] space-y-1">
                  <p>✓ Safe and secure checkout</p>
                  <p>✓ Easy returns within 30 days</p>
                  <p>✓ Fast shipping available</p>
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
