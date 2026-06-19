import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required."],
      trim: true,
      maxlength: [120, "Hotel name cannot exceed 120 characters."],
    },

    city: {
      type: String,
      enum: { values: ["Makkah", "Madinah"], message: "City must be Makkah or Madinah." },
      required: [true, "City is required."],
    },

    starRating: {
      type: Number,
      enum: { values: [2, 3, 4, 5], message: "Star rating must be 2, 3, 4, or 5." },
      required: [true, "Star rating is required."],
      default: 5,
    },

    distanceFromHaram: {
      type: String,
      trim: true,
      maxlength: [60, "Distance string cannot exceed 60 characters."],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters."],
      default: "",
    },

    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ city: 1, isActive: 1 });

export default mongoose.model("Hotel", hotelSchema);
