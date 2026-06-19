import express from "express";
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "./hotel.controller.js";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.post("/", createHotel);
router.patch("/:id", updateHotel);
router.delete("/:id", deleteHotel);

export default router;