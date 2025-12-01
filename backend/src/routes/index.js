import { Router } from "express";
import booksRouter from "./books.routes.js";
import cartRouter from "./cart.routes.js";
import usersRouter from "./users.routes.js";

const router = Router();

router.use("/books", booksRouter);
router.use("/cart", cartRouter);
router.use("/users", usersRouter);
export default router;