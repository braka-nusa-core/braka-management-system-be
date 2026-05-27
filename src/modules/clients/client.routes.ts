import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import {
    listClients,
    getClient,
    addClient,
    editClient,
    removeClient,
} from "./client.controller";

const router = Router();

router.use(protect);

router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", addClient);
router.patch("/:id", editClient);
router.delete("/:id", removeClient);

export default router;