import fs from "fs";
import cloudinary from "../../config/cloudinary.config.js";
import Image from "./image.model.js";

// Pull the base folder from .env, fallback to "default-project" if missing
const PROJECT_FOLDER = process.env.CLOUDINARY_PROJECT_FOLDER || "default-project";
const UPLOAD_FOLDER = `${PROJECT_FOLDER}/images`;

const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) fs.unlink(filePath, () => {});
};

// POST /images/single
export const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    let result;
    try {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: UPLOAD_FOLDER,
        format: "avif",
        quality: "auto",
        width: 1920,   // Shrinks large images (like 4K photos) to 1920px max width
        crop: "limit"  // Ensures small images aren't stretched
      });
    } finally {
      cleanupTempFile(req.file.path);
    }

    const image = await Image.create({
      url: result.secure_url,
      publicId: result.public_id,
      entityType: req.body.entityType || "gallery",
      entityId: req.body.entityId || null,
    });

    return res.status(201).json({ 
      success: true, 
      message: "Image uploaded successfully.", 
      data: image 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /images/multiple
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        return await cloudinary.uploader.upload(file.path, {
          folder: UPLOAD_FOLDER,
          format: "avif",
          quality: "auto",
          width: 1920,   // Applies size reduction limits to gallery images as well
          crop: "limit"
        });
      } finally {
        cleanupTempFile(file.path);
      }
    });

    const results = await Promise.all(uploadPromises);

    const images = await Image.insertMany(
      results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        entityType: req.body.entityType || "gallery",
        entityId: req.body.entityId || null,
      }))
    );

    return res.status(201).json({
      success: true,
      message: `${images.length} image(s) uploaded successfully.`,
      data: images,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /images
export const getImages = async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const images = await Image.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ 
      success: true, 
      total: images.length, 
      data: images 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /images/delete  — body: { publicId, id? }
export const deleteImage = async (req, res) => {
  try {
    const { publicId, id } = req.body;

    if (!publicId) {
      return res.status(400).json({ success: false, message: "publicId is required." });
    }

    // Ignore cloudinary deletion errors so we don't block DB cleanup
    await cloudinary.uploader.destroy(publicId).catch(() => {});

    if (id) {
      await Image.findByIdAndDelete(id);
    } else {
      await Image.findOneAndDelete({ publicId });
    }

    return res.status(200).json({ success: true, message: "Image deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};