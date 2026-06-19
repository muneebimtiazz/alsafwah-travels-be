import { resend } from "../config/resend.config.js";

const FROM = process.env.EMAIL_FROM;
const ADMIN = process.env.EMAIL_TO;

// ── Admin notification email ────────────────────────────────────────────────
export const sendAdminInquiryEmail = async (inquiry) => {
  const {
    fullName,
    phone,
    email,
    journeyType,
    travelers,
    message,
    packageTitle,
  } = inquiry;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
      <div style="background:#051a14;padding:20px 24px;border-radius:6px 6px 0 0;">
        <h1 style="color:#c9a84c;margin:0;font-size:18px;">New Inquiry — Lead Umrah</h1>
      </div>

      <div style="background:#fff;padding:24px;border-radius:0 0 6px 6px;border:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">

          <tr>
            <td style="padding:6px 0;color:#6b7280;width:160px;">Package</td>
            <td style="padding:6px 0;font-weight:600;">${packageTitle || "Not specified"}</td>
          </tr>

          <tr>
            <td style="padding:6px 0;color:#6b7280;">Full Name</td>
            <td style="padding:6px 0;font-weight:600;">${fullName}</td>
          </tr>

          <tr>
            <td style="padding:6px 0;color:#6b7280;">Phone</td>
            <td style="padding:6px 0;font-weight:600;">${phone}</td>
          </tr>

          <tr>
            <td style="padding:6px 0;color:#6b7280;">Email</td>
            <td style="padding:6px 0;">${email || "Not provided"}</td>
          </tr>

          <tr>
            <td style="padding:6px 0;color:#6b7280;">Journey Type</td>
            <td style="padding:6px 0;">${journeyType}</td>
          </tr>

          <tr>
            <td style="padding:6px 0;color:#6b7280;">Travelers</td>
            <td style="padding:6px 0;">${travelers}</td>
          </tr>

          ${
            message
              ? `
          <tr>
            <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Message</td>
            <td style="padding:6px 0;">${message}</td>
          </tr>`
              : ""
          }

        </table>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New Inquiry: ${fullName} — ${journeyType}`,
    html,
  });

  if (error) {
    console.error("Admin Email Error:", error);
  }
};

// ── Customer confirmation email ─────────────────────────────────────────────
export const sendCustomerConfirmationEmail = async (inquiry) => {
  if (!inquiry.email) return;

  const { fullName, journeyType, packageTitle } = inquiry;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#051a14;padding:20px 24px;border-radius:6px 6px 0 0;">
        <h1 style="color:#c9a84c;margin:0;font-size:18px;">Thank you, ${fullName}</h1>
      </div>

      <div style="background:#fff;padding:24px;border-radius:0 0 6px 6px;border:1px solid #e5e7eb;">
        <p style="color:#374151;font-size:14px;line-height:1.6;">
          We have received your inquiry
          ${packageTitle ? ` for <strong>${packageTitle}</strong>` : ""}.
        </p>

        <p style="color:#374151;font-size:14px;">
          Journey Type: <strong>${journeyType}</strong>
        </p>

        <p style="color:#6b7280;font-size:13px;margin-top:24px;">
          Our team will contact you within 2 hours.
        </p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: inquiry.email,
    subject: "We received your inquiry — Lead Umrah",
    html,
  });

  if (error) {
    console.error("Customer Email Error:", error);
  }
};