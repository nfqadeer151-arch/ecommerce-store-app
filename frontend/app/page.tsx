// frontend/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCartStore, Product } from "../store/cartStore";

const BACKEND_URL = "http://localhost:5000/api";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const [toastMessage, setToastMessage] = useState("");

  // Seed fallback products in case backend isn't running
  const fallbackProducts: Product[] = [
    {
      id: "prod-1",
      name: "Quantum Sound Wireless Headphones",
      description: "Experience absolute acoustic precision with active noise cancelling, 40-hour battery life, and spatial audio feedback.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      reviews: [{ userId: "user-1", rating: 5, comment: "Amazing", date: "" }]
    },
    {
      id: "prod-2",
      name: "AeroSport Chronograph Smartwatch",
      description: "Water-resistant performance smartwatch equipped with optical heart monitor, GPS navigation, and customized workout tracking.",
      price: 189.50,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
      category: "Wearables",
      reviews: []
    },
    {
      id: "prod-3",
      name: "Nebula Glass Smart Coffee Maker",
      description: "Wifi-enabled drip coffee maker with precision brewing temperature controls, schedule timers, and mobile integration.",
      price: 120.00,
      imageUrl: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&auto=format&fit=crop&q=60",
      category: "Home Appliances",
      reviews: []
    },
    {
      id: "prod-4",
      name: "Apex Gaming Mouse",
      description: "Ergonomic gaming mouse featuring 26K DPI optical sensor, custom RGB zones, and 8 programmable buttons.",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      reviews: []
    }
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/products`);
        setProducts(response.data);
        setError("");
      } catch (err) {
        console.warn("Backend not reached, using local seed products.");
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md z-50 flex items-center space-x-2 transition-transform duration-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            Exclusive Launch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-tight leading-tight">
            Elevate Your Smart Lifestyle
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Experience next-generation smart accessories with stunning design, high performance, and seamless connectivity.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl -z-1" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-600/10 rounded-full filter blur-3xl -z-1" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="bg-slate-200 dark:bg-slate-800 aspect-square rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const avgRating = product.reviews.length
              ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
              : "No reviews";

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-slate-700 dark:text-slate-300 border border-slate-200/55 dark:border-slate-800/50">
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-semibold">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{avgRating} {product.reviews.length > 0 && `(${product.reviews.length})`}</span>
                    </div>
                    <h3 className="font-bold text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold font-outfit">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addItem(product);
                        triggerToast(`${product.name} added to cart!`);
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white transition-all shadow-sm flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
