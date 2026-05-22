// backend/src/routes/index.ts
import { Router } from "express";
import authRouter from "./auth";
import meRouter from "./me";
import productsRouter from "./products";
import ordersRouter from "./orders";
import feedbackRouter from "./feedback";

const router = Router();

// Mount routes
router.use("/auth", authRouter);
router.use("/auth", meRouter); // this maps GET /auth/me -> meRouter
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/feedback", feedbackRouter);

export default router;
