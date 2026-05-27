import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import {
    listProgress,
    getProgress,
    addProgress,
    editProgress,
    removeProgress,
    regenerateProgressToken,
    getPublicProgress,
} from "./progress.controller";

const router = Router();

// ── Public route (no auth) ───────────────────────────────────
router.get("/public/:token", getPublicProgress);

// ── Admin routes (protected) ─────────────────────────────────
router.use(protect);

router.get("/", listProgress);
router.get("/:id", getProgress);
router.post("/", addProgress);
router.patch("/:id", editProgress);
router.delete("/:id", removeProgress);
router.post("/:id/regenerate-token", regenerateProgressToken);

export default router;