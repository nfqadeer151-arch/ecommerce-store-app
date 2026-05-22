// backend/src/routes/orders.ts
import { Router, Request, Response } from "express";
import { db, Order } from "../models";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET all orders for the current user
router.get("/", authenticate, (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const userOrders = db.orders.filter(o => o.userId === user?.id);
  res.json(userOrders);
});

// POST place a new order
router.post("/", authenticate, (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { items, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order items are required." });
  }

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    userId: user?.id || "anonymous",
    items,
    total: Number(total),
    createdAt: new Date().toISOString(),
    status: "completed"
  };

  db.orders.push(newOrder);
  res.status(201).json(newOrder);
});

export default router;
