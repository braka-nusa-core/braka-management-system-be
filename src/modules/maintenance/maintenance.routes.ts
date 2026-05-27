import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import {
    listMaintenance,
    getMaintenance,
    addMaintenance,
    editMaintenance,
    removeMaintenance,
} from "./maintenance.controller";

const router = Router();

router.use(protect);

router.get("/", listMaintenance);
router.get("/:id", getMaintenance);
router.post("/", addMaintenance);
router.patch("/:id", editMaintenance);
router.delete("/:id", removeMaintenance);

export default router;