import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required."],
    },

    publicId: {
      type: String,
      required: [true, "Cloudinary public_id is required."],
      unique: true,
    },

    entityType: {
      type: String,
      enum: ["hotel", "package", "hero", "gallery"],
      default: "gallery",
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

imageSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model("Image", imageSchema);
