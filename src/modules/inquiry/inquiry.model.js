import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },

    phone: {
      type: String,
      required: [true, "Phone / WhatsApp number is required."],
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters."],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: [150, "Email cannot exceed 150 characters."],
    },

    journeyType: {
      type: String,
      required: [true, "Journey type is required."],
      enum: {
        values: ["Umrah Package", "Hajj Package", "Custom Itinerary", "Visa Only"],
        message: "Invalid journey type.",
      },
    },

    travelers: {
      type: String,
      required: [true, "Traveler count is required."],
      enum: {
        values: ["1 Pilgrim", "2 Pilgrims", "3-4 Pilgrims", "5+ Pilgrims"],
        message: "Invalid traveler count.",
      },
    },

    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Message cannot exceed 1000 characters."],
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },

    packageTitle: { type: String, default: "" },

    status: {
      type: String,
      enum: ["new", "contacted", "converted", "closed"],
      default: "new",
    },

    adminNotes: {
      type: String,
      default: "",
      maxlength: [2000, "Admin notes cannot exceed 2000 characters."],
    },
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ packageId: 1 });

export default mongoose.model("Inquiry", inquirySchema);
