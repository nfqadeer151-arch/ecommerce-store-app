// frontend/app/account/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "../../lib/auth";
import { useCartStore } from "../../store/cartStore";

const BACKEND_URL = "http://localhost:5000/api";

interface Order {
  id: string;
  total: number;
  createdAt: string;
  status: string;
  items: any[];
}

export default function AccountPage() {
  const { session, status, login, logout } = useSession();
  const cart = useCartStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  // Fetch orders when authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchOrders();
    }
  }, [status, session]);

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`${BACKEND_URL}/orders`, {
        headers: { Authorization: `Bearer ${session?.token}` }
      });
      setOrders(response.data);
    } catch (err) {
      console.warn("Could not fetch orders from backend, using simulated local storage.");
      const localOrders = localStorage.getItem("orders");
      if (localOrders) {
        setOrders(JSON.parse(localOrders));
      }
    } finally {
      setLoadingOrders(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError("");
      const response = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      console.warn("Backend authentication failed, using offline fallback login.");
      if (email === "user@example.com" && password === "password123") {
        login("mock_token", { id: "user-1", email: "user@example.com", role: "user" });
      } else if (email === "admin@example.com" && password === "admin123") {
        login("mock_admin_token", { id: "admin-1", email: "admin@example.com", role: "admin" });
      } else {
        setAuthError("Invalid credentials. Try user@example.com / password123");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    try {
      setOrderSuccess("");
      // Post to backend
      const response = await axios.post(
        `${BACKEND_URL}/orders`,
        { items: cart.items, total: cart.total },
        { headers: { Authorization: `Bearer ${session?.token}` } }
      );
      setOrders((prev) => [response.data, ...prev]);
      cart.clearCart();
      setOrderSuccess("Order placed successfully!");
    } catch (err) {
      console.warn("Backend checkout offline. Simulating local checkout.");
      const mockOrder: Order = {
        id: `ord-${Date.now()}`,
        total: cart.total,
        createdAt: new Date().toISOString(),
        status: "completed",
        items: [...cart.items]
      };
      const updatedOrders = [mockOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      cart.clearCart();
      setOrderSuccess("Success (Local Mock): Order placed!");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated" || !session) {
    return (
      <div className="max-w-md mx-auto space-y-8 animate-fade-in py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Access your order history, shopping cart, and custom recommendations.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          {authError && (
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all focus:outline-none disabled:opacity-50"
            >
              {authLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="text-center text-xs text-slate-400 pt-2">
            Demo Credentials: <span className="font-semibold">user@example.com</span> / <span className="font-semibold">password123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold font-outfit tracking-tight">
            Account Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Logged in as: <span className="font-semibold text-slate-700 dark:text-slate-200">{session.user.email}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-xs font-semibold border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Center: Shopping Cart & Orders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Cart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-outfit">Active Shopping Cart</h2>

            {orderSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                {orderSuccess}
              </div>
            )}

            {cart.items.length === 0 ? (
              <p className="text-slate-500 text-sm">Your cart is empty. Add products from the homepage.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center py-3">
                      <div>
                        <p className="font-bold text-sm">{item.product.name}</p>
                        <p className="text-xs text-slate-500">
                          ${item.product.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => cart.removeItem(item.product.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 font-bold">
                  <span>Total Amount</span>
                  <span className="text-lg font-outfit">${cart.total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all text-sm"
                >
                  Place Simulated Order
                </button>
              </div>
            )}
          </div>

          {/* Past Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-outfit">Order History</h2>

            {loadingOrders ? (
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-slate-500 text-sm">You have not placed any orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>ID: {order.id}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            {item.product.name} <span className="text-xs text-slate-500">x{item.quantity}</span>
                          </span>
                          <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/40 font-bold text-sm">
                      <span>Total Paid</span>
                      <span className="text-blue-600 dark:text-blue-400 font-outfit">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Profile details & instructions */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-outfit">My Profile</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold">User ID</span>
                <span className="font-semibold">{session.user.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold">Email</span>
                <span className="font-semibold">{session.user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold">Role</span>
                <span className="font-semibold capitalize text-blue-500">{session.user.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-sm">
            <h3 className="text-lg font-bold font-outfit bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
              Instructor Notes
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This demo stores orders dynamically. If the backend is running, it calls the Express `/api/orders` endpoints. If offline, it transparently falls back to localStorage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
