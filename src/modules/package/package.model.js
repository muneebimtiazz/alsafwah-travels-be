import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required."],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters."],
    },

    description: {
      type: String,
      required: [true, "Package description is required."],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },

    journeyType: {
      type: String,
      enum: { values: ["Umrah", "Hajj"], message: "Journey type must be Umrah or Hajj." },
      required: [true, "Journey type is required."],
      default: "Umrah",
    },

    tier: {
      type: String,
      enum: { 
        values: ["budget", "value", "luxury", "ramadan", "view", "december"], 
        message: "Invalid tier." 
      },
      required: [true, "Tier is required."],
      default: "budget",
    },
    makkahNights: {
      type: Number,
      required: [true, "Makkah nights is required."],
      min: [1, "Makkah nights must be at least 1."],
      default: 4,
    },

    madinahNights: {
      type: Number,
      required: [true, "Madinah nights is required."],
      min: [1, "Madinah nights must be at least 1."],
      default: 3,
    },

    makkahHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },

    madinahHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },

    inclusions: {
      visa:               { type: Boolean, default: false },
      flights:            { type: Boolean, default: false },
      hotelAccommodation: { type: Boolean, default: false },
      airportTransfers:   { type: Boolean, default: false },
      groundTransport:    { type: Boolean, default: false },
      ziyaratTours:       { type: Boolean, default: false },
      meals:              { type: Boolean, default: false },
    },

    pricing: {
      amount: {
        type: Number,
        required: [true, "Pricing amount is required."],
        min: [0, "Price cannot be negative."],
      },
      currency: {
        type: String,
        enum: { values: ["GBP", "PKR"], message: "Currency must be GBP or PKR." },
        default: "GBP",
      },
      sharingType: {
        type: String,
        enum: { values: ["Single", "Double", "Triple", "Quad"], message: "Invalid sharing type." },
        default: "Triple",
      },
    },

    directFlights: { type: Boolean, default: false },

    heroImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null,
    },

    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

packageSchema.virtual("totalNights").get(function () {
  return (this.makkahNights || 0) + (this.madinahNights || 0);
});

packageSchema.index({ journeyType: 1, isActive: 1 });
packageSchema.index({ tier: 1, isActive: 1 });
packageSchema.index({ isFeatured: 1, isActive: 1 });
packageSchema.index({ title: "text", description: "text" });

export default mongoose.model("Package", packageSchema);
