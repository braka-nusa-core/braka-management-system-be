import { Router } from "express";
import { login, getMe } from "./auth.controller";
import { protect } from "./auth.middleware";

const router = Router();

// Public
router.post("/login", login);

// Protected
router.get("/me", protect, getMe);

export default router;