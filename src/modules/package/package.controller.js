import Package from "./package.model.js";
import Hotel from "../hotel/hotel.model.js";
import Image from "../image/image.model.js";
import cloudinary from "../../config/cloudinary.config.js"; // Required for cascade deletion

// GET /packages
export const getAllPackages = async (req, res) => {
  try {
    const {
      journeyType, tier,
      isActive = "true",
      isFeatured, search,
      page = 1, limit = 12,
    } = req.query;

    const filter = {};
    if (journeyType) filter.journeyType = journeyType;
    if (tier) filter.tier = tier;
    if (isActive !== "all") filter.isActive = isActive === "true";
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .populate("makkahHotel", "name starRating distanceFromHaram city images")
        .populate("madinahHotel", "name starRating distanceFromHaram city images")
        .populate("heroImage", "url publicId")
        .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Package.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: packages,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /packages/:id
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate({
        path: "makkahHotel",
        select: "name starRating distanceFromHaram city description images",
        populate: { path: "images", select: "url publicId" },
      })
      .populate({
        path: "madinahHotel",
        select: "name starRating distanceFromHaram city description images",
        populate: { path: "images", select: "url publicId" },
      })
      .populate("heroImage", "url publicId")
      .lean({ virtuals: true });

    if (!pkg) return res.status(404).json({ success: false, message: "Package not found." });

    return res.status(200).json({ success: true, data: pkg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /packages
export const createPackage = async (req, res) => {
  try {
    const {
      title, description, journeyType, tier,
      makkahNights, madinahNights,
      makkahHotel, madinahHotel,
      makkahHotelData, madinahHotelData,
      inclusions, pricing, directFlights,
      heroImage, isActive, isFeatured,
    } = req.body;

    let resolvedMakkahHotel = makkahHotel || null;
    let resolvedMadinahHotel = madinahHotel || null;

    if (!resolvedMakkahHotel && makkahHotelData) {
      const h = await Hotel.create({ ...makkahHotelData, city: "Makkah" });
      resolvedMakkahHotel = h._id;
    }
    if (!resolvedMadinahHotel && madinahHotelData) {
      const h = await Hotel.create({ ...madinahHotelData, city: "Madinah" });
      resolvedMadinahHotel = h._id;
    }

    const pkg = await Package.create({
      title,
      description,
      journeyType: journeyType || "Umrah",
      tier: tier || "budget",
      makkahNights: makkahNights || 4,
      madinahNights: madinahNights || 3,
      makkahHotel: resolvedMakkahHotel,
      madinahHotel: resolvedMadinahHotel,
      inclusions: inclusions || {},
      pricing,
      directFlights: directFlights || false,
      heroImage: heroImage || null,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
    });

    if (heroImage) {
      await Image.findByIdAndUpdate(heroImage, {
        entityType: "package",
        entityId: pkg._id,
      });
    }

    const populated = await pkg.populate([
      { path: "makkahHotel", select: "name starRating city" },
      { path: "madinahHotel", select: "name starRating city" },
      { path: "heroImage", select: "url publicId" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Package created successfully.",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /packages/:id
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found." });

    const allowedTopLevel = [
      "title", "description", "journeyType", "tier",
      "makkahNights", "madinahNights",
      "makkahHotel", "madinahHotel",
      "directFlights", "heroImage", "isActive", "isFeatured",
    ];

    allowedTopLevel.forEach((field) => {
      if (req.body[field] !== undefined) pkg[field] = req.body[field];
    });

    if (req.body.pricing) {
      if (req.body.pricing.amount !== undefined) pkg.pricing.amount = req.body.pricing.amount;
      if (req.body.pricing.currency !== undefined) pkg.pricing.currency = req.body.pricing.currency;
      if (req.body.pricing.sharingType !== undefined) pkg.pricing.sharingType = req.body.pricing.sharingType;
    }

    if (req.body.inclusions) {
      const keys = [
        "visa", "flights", "hotelAccommodation", "airportTransfers",
        "groundTransport", "ziyaratTours", "meals",
      ];
      keys.forEach((key) => {
        if (req.body.inclusions[key] !== undefined) pkg.inclusions[key] = req.body.inclusions[key];
      });
      pkg.markModified("inclusions");
    }

    await pkg.save();

    if (req.body.heroImage) {
      await Image.findByIdAndUpdate(req.body.heroImage, {
        entityType: "package",
        entityId: pkg._id,
      });
    }

    const populated = await pkg.populate([
      { path: "makkahHotel", select: "name starRating city" },
      { path: "madinahHotel", select: "name starRating city" },
      { path: "heroImage", select: "url publicId" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Package updated successfully.",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /packages/:id - HARD DELETE (permanently removes package, hotels, and images)
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found." });
    }

    // 1. Clean up Hero Image from Cloudinary and DB
    if (pkg.heroImage) {
      const heroImgDoc = await Image.findById(pkg.heroImage);
      if (heroImgDoc) {
        await cloudinary.uploader.destroy(heroImgDoc.publicId).catch(() => {});
        await heroImgDoc.deleteOne();
      }
    }

    // 2. Clean up associated Hotels and their Gallery Images
    const hotelsToDelete = [pkg.makkahHotel, pkg.madinahHotel].filter(Boolean);
    
    for (const hotelId of hotelsToDelete) {
      const hotel = await Hotel.findById(hotelId);
      if (hotel) {
        // Grab all images attached to this hotel
        const hotelImages = await Image.find({ _id: { $in: hotel.images } });
        
        // Delete each image from Cloudinary and DB
        for (const img of hotelImages) {
          await cloudinary.uploader.destroy(img.publicId).catch(() => {});
          await img.deleteOne();
        }
        
        // Finally, delete the hotel document
        await hotel.deleteOne();
      }
    }

    // 3. Delete the package document itself
    await pkg.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Package, associated hotels, and all images deleted permanently.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};