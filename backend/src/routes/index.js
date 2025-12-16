import { Router } from "express";
import booksRouter from "./books.routes.js";
import cartRouter from "./cart.routes.js";
import usersRouter from "./users.routes.js";
import orderRouter from "./order.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.use("/books", booksRouter);
router.use("/cart", cartRouter);
router.use("/users", usersRouter);
router.use("/orders", orderRouter);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadRoutes);

export default router;
