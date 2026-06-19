import express from "express";
import { 
  uploadSingle, 
  uploadMultiple, 
  getImages, 
  deleteImage 
} from "./image.controller.js";
import { upload } from "../../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", getImages);
router.post("/single", upload.single("image"), uploadSingle);
router.post("/multiple", upload.array("images", 10), uploadMultiple);
router.delete("/delete", deleteImage);

export default router;