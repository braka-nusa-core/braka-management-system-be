import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import {
    listNotifications,
    readNotification,
    readAllNotifications,
} from "./notification.controller";

const router = Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);

export default router;