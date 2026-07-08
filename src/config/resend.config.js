
import "dotenv/config";

export const RESEND_API_URL = "https://api.resend.com/emails";

export const RESEND_HEADERS = {
  Authorization: `Bearer ${process.env.RESEND_API_KEY || ""}`,
  "Content-Type": "application/json",
};

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  clientUrl: process.env.CLIENT_URL || "",
  companyName: "Al Safwah Group",
  supportEmail: "info@alsafwahgroup.co.uk",
  year: new Date().getFullYear(),
};

export const isEmailConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.CLIENT_URL);