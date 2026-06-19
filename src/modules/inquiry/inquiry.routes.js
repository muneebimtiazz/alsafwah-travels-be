import express from "express";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} from "./inquiry.controller.js";

const router = express.Router();

router.post("/", createInquiry);
router.get("/", getAllInquiries);
router.get("/:id", getInquiryById);
router.patch("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

export default router;
