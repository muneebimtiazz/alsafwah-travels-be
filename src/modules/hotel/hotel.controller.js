import Hotel from "./hotel.model.js";
import Image from "../image/image.model.js";

// GET /hotels
export const getAllHotels = async (req, res) => {
  try {
    const { city, isActive = "true", page = 1, limit = 20 } = req.query;

    const filter = {};
    if (city) filter.city = city;
    if (isActive !== "all") filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate("images", "url publicId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Hotel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: hotels,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /hotels/:id
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("images", "url publicId")
      .lean();

    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });

    return res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /hotels
export const createHotel = async (req, res) => {
  try {
    const { name, city, starRating, distanceFromHaram, description, images } = req.body;

    const hotel = await Hotel.create({
      name,
      city,
      starRating,
      distanceFromHaram,
      description,
      images: images || [],
    });

    // Link uploaded images to this specific hotel
    if (images?.length) {
      await Image.updateMany(
        { _id: { $in: images } },
        { $set: { entityType: "hotel", entityId: hotel._id } }
      );
    }

    const populated = await hotel.populate("images", "url publicId");

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully.",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /hotels/:id
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });

    const allowedFields = [
      "name", "city", "starRating", "distanceFromHaram",
      "description", "images", "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) hotel[field] = req.body[field];
    });

    await hotel.save();

    // Re-link newly assigned images
    if (req.body.images?.length) {
      await Image.updateMany(
        { _id: { $in: req.body.images } },
        { $set: { entityType: "hotel", entityId: hotel._id } }
      );
    }

    const populated = await hotel.populate("images", "url publicId");

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully.",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /hotels/:id  (soft delete)
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });

    hotel.isActive = false;
    await hotel.save();

    return res.status(200).json({ success: true, message: "Hotel deactivated successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};