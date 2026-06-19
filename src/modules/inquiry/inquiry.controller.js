import Inquiry from "./inquiry.model.js";
import { sendAdminInquiryEmail, sendCustomerConfirmationEmail } from "../../utils/email.js";

// POST /inquiries
export const createInquiry = async (req, res) => {
  try {
    const {
      fullName, phone, email, journeyType,
      travelers, message, packageId, packageTitle,
    } = req.body;

    const inquiry = await Inquiry.create({
      fullName,
      phone,
      email: email || "",
      journeyType,
      travelers,
      message: message || "",
      packageId: packageId || null,
      packageTitle: packageTitle || "",
    });

    // Fire emails in background — don't block response
    Promise.all([
      sendAdminInquiryEmail(inquiry).catch((err) =>
        console.error("Admin email failed:", err.message)
      ),
      sendCustomerConfirmationEmail(inquiry).catch((err) =>
        console.error("Customer email failed:", err.message)
      ),
    ]);

    return res.status(201).json({
      success: true,
      message: "Your inquiry has been received. Our team will respond within 2 hours.",
      data: { id: inquiry._id },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /inquiries
export const getAllInquiries = async (req, res) => {
  try {
    const { status, packageId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (packageId) filter.packageId = packageId;

    const skip = (Number(page) - 1) * Number(limit);

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("packageId", "title journeyType tier")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: inquiries,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /inquiries/:id
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("packageId", "title journeyType tier pricing")
      .lean();

    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found." });

    return res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /inquiries/:id/status
export const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found." });

    inquiry.status = req.body.status;
    if (req.body.adminNotes !== undefined) inquiry.adminNotes = req.body.adminNotes;

    await inquiry.save();

    return res.status(200).json({ success: true, message: "Inquiry status updated.", data: inquiry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /inquiries/:id
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found." });

    return res.status(200).json({ success: true, message: "Inquiry deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
