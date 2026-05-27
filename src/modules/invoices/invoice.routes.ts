import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import {
    listInvoices,
    getInvoice,
    addInvoice,
    editInvoice,
    removeInvoice,
    markPaid,
} from "./invoice.controller";

const router = Router();

router.use(protect);

router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.post("/", addInvoice);
router.patch("/:id", editInvoice);
router.delete("/:id", removeInvoice);
router.post("/:id/mark-as-paid", markPaid);

export default router;