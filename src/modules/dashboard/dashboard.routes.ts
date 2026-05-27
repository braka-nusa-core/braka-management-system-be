import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import { getSummary } from "./dashboard.controller";

const router = Router();

router.use(protect);

router.get("/summary", getSummary);

export default router;