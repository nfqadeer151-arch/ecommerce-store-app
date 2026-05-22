// backend/src/routes/feedback.ts
import { Router, Request, Response } from "express";
import { db, Review } from "../models";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// POST a review / feedback for a product
router.post("/", authenticate, (req: Request, res: Response) => {
  const { productId, rating, comment } = req.body;
  const user = (req as AuthenticatedRequest).user;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: "productId, rating (1-5), and comment are required." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  const newReview: Review = {
    userId: user?.id || "anonymous",
    rating: Number(rating),
    comment,
    date: new Date().toISOString()
  };

  product.reviews.push(newReview);
  res.status(201).json({ message: "Review saved!", review: newReview });
});

export default router;
