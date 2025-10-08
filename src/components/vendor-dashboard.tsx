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
}

export default function VendorDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<any>(null);

  // Add Product Form State
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrls, setEditImageUrls] = useState("");

  // Delete Product State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/products/vendor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to fetch products",
        "error"
      );
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const images = imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productName,
          description: description || undefined,
          price: parseFloat(price),
          stock: parseInt(stock),
          images,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add product");
      }

      const newProduct = await response.json();
      setProducts([newProduct, ...products]);

      setProductName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrls("");

      showToast("Product added successfully!");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add product",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || "");
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditImageUrls(product.images.map((img) => img.url).join(", "));
    setEditDialogOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const images = editImageUrls
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const response = await fetch(`${apiUrl}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription || undefined,
          price: parseFloat(editPrice),
          stock: parseInt(editStock),
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update product");
      }

      const updatedProduct = await response.json();
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );

      setEditDialogOpen(false);
      setEditingProduct(null);

      showToast("Product updated successfully!");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to update product",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/products/${deletingProduct.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== deletingProduct.id));
      setDeleteDialogOpen(false);
      setDeletingProduct(null);

      showToast("Product deleted successfully!");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete product",
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

      {/* Header/Navigation */}
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

        <nav className="flex items-center gap-6">
          <button
            onClick={() => router.push("/vendor/dashboard")}
            className="text-[#f2690d] text-sm font-bold"
          >
            Products
          </button>
          <button
            onClick={() => router.push("/vendor/orders")}
            className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
          >
            Orders
          </button>
          <button
            onClick={() => router.push("/products")}
            className="text-[#181411] text-sm font-medium hover:text-[#f2690d] transition-colors"
          >
            Browse Products
          </button>
          <div className="flex items-center gap-3 border-l border-[#e6dfdb] pl-6">
            <span className="text-[#8a7160] text-sm">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-[#181411] border border-[#e6dfdb] rounded-lg hover:bg-[#f5f2f0] transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-10 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-[#181411] text-3xl font-bold mb-2">
              Vendor Dashboard
            </h1>
            <p className="text-[#8a7160]">Manage your products and inventory</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* Add Product Form */}
            <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
              <h2 className="text-[#181411] text-xl font-bold mb-4">
                Add New Product
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-[#181411] text-base font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#181411] text-base font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                    placeholder="Enter product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#181411] text-base font-medium mb-2">
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#181411] text-base font-medium mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#181411] text-base font-medium mb-2">
                    Image URLs
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-[#e6dfdb] rounded-lg text-[#181411] placeholder:text-[#8a7160] focus:outline-none focus:ring-2 focus:ring-[#f2690d]"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-[#8a7160] mt-1">
                    Enter comma-separated image URLs
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f2690d] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#d95a0a] disabled:bg-[#e6dfdb] disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? "Adding Product..." : "Add Product"}
                </button>
              </form>
            </div>

            {/* Product List */}
            <div className="bg-white border border-[#e6dfdb] rounded-lg p-6">
              <h2 className="text-[#181411] text-xl font-bold mb-4">
                Your Products
              </h2>

              {fetchingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin text-4xl">⏳</div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-[#8a7160]">
                    No products yet. Add your first product to get started!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e6dfdb]">
                        <th className="text-left py-3 px-2 text-[#181411] font-bold">
                          Product Name
                        </th>
                        <th className="text-right py-3 px-2 text-[#181411] font-bold">
                          Price
                        </th>
                        <th className="text-right py-3 px-2 text-[#181411] font-bold">
                          Stock
                        </th>
                        <th className="text-right py-3 px-2 text-[#181411] font-bold">
                          Images
                        </th>
                        <th className="text-right py-3 px-2 text-[#181411] font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-[#e6dfdb] hover:bg-[#f5f2f0]"
                        >
                          <td className="py-3 px-2 text-[#181411]">
                            {product.name}
                          </td>
                          <td className="py-3 px-2 text-right text-[#f2690d] font-bold">
                            Rs. {product.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-right text-[#181411]">
                            {product.stock}
                          </td>
                          <td className="py-3 px-2 text-right text-[#181411]">
                            {product.images.length}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              className="px-3 py-1 border border-[#e6dfdb] rounded mr-2 text-[#181411] hover:bg-white"
                              onClick={() => handleEditClick(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1 border border-[#e6dfdb] rounded text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(product)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#181411] text-xl font-bold mb-4">
              Edit Product
            </h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <input
                type="text"
                className="w-full px-4 py-2 border border-[#e6dfdb] rounded-lg"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Product Name"
                required
              />
              <textarea
                className="w-full px-4 py-2 border border-[#e6dfdb] rounded-lg"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#e6dfdb] rounded-lg"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Price"
                  required
                />
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-[#e6dfdb] rounded-lg"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  placeholder="Stock"
                  required
                />
              </div>
              <textarea
                className="w-full px-4 py-2 border border-[#e6dfdb] rounded-lg"
                value={editImageUrls}
                onChange={(e) => setEditImageUrls(e.target.value)}
                placeholder="Image URLs"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-[#e6dfdb] rounded-lg"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f2690d] text-white rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setDeleteDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#181411] text-xl font-bold mb-2">
              Are you sure?
            </h3>
            <p className="text-[#8a7160] mb-4">
              Delete {deletingProduct?.name}? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border border-[#e6dfdb] rounded-lg"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
