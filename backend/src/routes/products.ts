// backend/src/routes/products.ts
import { Router, Request, Response } from "express";
import { db, Product } from "../models";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// GET all products (with optional category filter)
router.get("/", (req: Request, res: Response) => {
  const { category } = req.query;
  let products = db.products;
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  res.json(products);
});

// GET single product
router.get("/:id", (req: Request, res: Response) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// POST create product (admin only)
router.post("/", authenticate, requireAdmin, (req: Request, res: Response) => {
  const { name, description, price, imageUrl, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Name, price, and category are required" });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    description: description || "",
    price: Number(price),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    category,
    reviews: []
  };

  db.products.push(newProduct);
  res.status(201).json(newProduct);
});

export default router;
