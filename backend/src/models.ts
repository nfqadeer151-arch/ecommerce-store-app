// backend/src/models.ts
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  reviews: Review[];
}

export interface Review {
  userId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Simple in-memory DB
export const db = {
  users: [
    {
      id: "user-1",
      email: "user@example.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "user"
    },
    {
      id: "admin-1",
      email: "admin@example.com",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin"
    }
  ] as User[],
  products: [
    {
      id: "prod-1",
      name: "Quantum Sound Wireless Headphones",
      description: "Experience absolute acoustic precision with active noise cancelling, 40-hour battery life, and spatial audio feedback.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
      category: "Electronics",
      reviews: [
        { userId: "user-1", rating: 5, comment: "Incredible sound quality and very comfortable!", date: new Date().toISOString() }
      ]
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
  ] as Product[],
  orders: [] as Order[],
};
