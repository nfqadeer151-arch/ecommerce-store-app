// services/recommendations/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Seed product dataset for the recommendation engine
const catalog = [
  {
    id: "prod-1",
    name: "Quantum Sound Wireless Headphones",
    price: 299.99,
    category: "Electronics",
    description: "Active noise cancelling wireless headphones."
  },
  {
    id: "prod-2",
    name: "AeroSport Chronograph Smartwatch",
    price: 189.50,
    category: "Wearables",
    description: "Smartwatch with heart monitor and GPS."
  },
  {
    id: "prod-3",
    name: "Nebula Glass Smart Coffee Maker",
    price: 120.00,
    category: "Home Appliances",
    description: "Wifi-enabled smart coffee maker."
  },
  {
    id: "prod-4",
    name: "Apex Gaming Mouse",
    price: 79.99,
    category: "Electronics",
    description: "Ergonomic high-DPI gaming mouse."
  }
];

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ service: "recommendation-service", status: "up", port: PORT });
});

// Recommendation algorithm endpoint
app.get("/api/recommendations", (req: Request, res: Response) => {
  const { productId, limit = 2 } = req.query;

  if (!productId) {
    // If no productId is specified, return popular/highest priced items
    const recommendations = [...catalog].sort((a, b) => b.price - a.price).slice(0, Number(limit));
    return res.json({
      algorithm: "popular-items-fallback",
      recommendations
    });
  }

  const targetProduct = catalog.find((p) => p.id === productId);
  if (!targetProduct) {
    return res.status(404).json({ error: "Product not found in recommendation catalog." });
  }

  // Content-based filtering: find products in the same category (excluding current product)
  let recommendations = catalog.filter((p) => p.category === targetProduct.category && p.id !== targetProduct.id);

  // If not enough recommendations in the same category, fill with other items
  if (recommendations.length < Number(limit)) {
    const filler = catalog.filter((p) => p.category !== targetProduct.category && p.id !== targetProduct.id);
    recommendations = [...recommendations, ...filler];
  }

  // Limit recommendations to requested size
  recommendations = recommendations.slice(0, Number(limit));

  res.json({
    productId,
    algorithm: "category-content-matching",
    recommendations
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Recommendation Microservice listening on http://localhost:${PORT}`);
});
