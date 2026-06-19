import express from "express";
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "./package.controller.js";

const router = express.Router();

router.get("/", getAllPackages);
router.get("/:id", getPackageById);
router.post("/", createPackage);
router.patch("/:id", updatePackage);
router.delete("/:id", deletePackage);

export default router;