import { RESEND_API_URL, RESEND_HEADERS, EMAIL_CONFIG } from "../config/resend.config.js";

const ADMIN = process.env.EMAIL_TO; // Ensure EMAIL_TO is in your .env for the admin destination

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
    createdAt
  } = inquiry;

  const dateStr = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString();

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f5f5; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #051A14; padding: 35px 24px; text-align: center; border-bottom: 4px solid #C9A84C;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            New Lead Received
          </h1>
          <p style="color: #8ab5a0; margin: 8px 0 0 0; font-size: 13px;">${EMAIL_CONFIG.companyName} Admin Portal</p>
        </div>

        <div style="padding: 30px 24px;">
          <p style="color: #374151; font-size: 15px; margin-top: 0; margin-bottom: 25px;">
            A new inquiry has just been submitted via the website. Please review the details below.
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 130px; font-weight: 600;">Package</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold;">
                ${packageTitle || "General Inquiry"}
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Client Name</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Phone</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">
                <a href="tel:${phone}" style="color: #C9A84C; text-decoration: none; font-weight: bold;">${phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Email</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">
                ${email ? `<a href="mailto:${email}" style="color: #051A14; text-decoration: none;">${email}</a>` : "<span style='color:#9ca3af;font-style:italic;'>Not provided</span>"}
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Journey Type</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${journeyType || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Travelers</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">
                <span style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                  ${travelers || "Not specified"}
                </span>
              </td>
            </tr>
            ${
              message
                ? `
            <tr>
              <td colspan="2" style="padding: 20px 0 8px 0; color: #6b7280; font-weight: 600;">Client Message / Notes:</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px; background-color: #fdfbf7; border-left: 3px solid #C9A84C; color: #374151; font-style: italic; border-radius: 0 6px 6px 0;">
                "${message}"
              </td>
            </tr>`
                : ""
            }
          </table>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="${EMAIL_CONFIG.clientUrl}/admin/inquiries" style="display: inline-block; background-color: #C9A84C; color: #051A14; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              View in Admin Dashboard
            </a>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            Received on ${dateStr} • ${EMAIL_CONFIG.companyName} Internal Automated System
          </p>
        </div>

      </div>
    </div>
  `;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: RESEND_HEADERS,
      body: JSON.stringify({
        from: EMAIL_CONFIG.from,
        to: ADMIN,
        subject: `New Lead: ${fullName} — ${journeyType || "Inquiry"}`,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Admin Email Error:", errorData);
    }
  } catch (error) {
    console.error("Admin Email Request Failed:", error);
  }
};

// ── Customer confirmation email ─────────────────────────────────────────────
export const sendCustomerConfirmationEmail = async (inquiry) => {
  if (!inquiry.email) return;

  const { fullName, journeyType, packageTitle } = inquiry;

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f5f5; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #051A14; padding: 40px 24px; text-align: center; border-bottom: 4px solid #C9A84C;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            ${EMAIL_CONFIG.companyName}
          </h1>
          <p style="color: #8ab5a0; margin: 8px 0 0 0; font-size: 13px; letter-spacing: 1px;">Sacred Journeys, Perfected.</p>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #111827; font-size: 20px; margin-top: 0;">As-salamu alaykum, ${fullName.split(' ')[0]}</h2>
          
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for reaching out to ${EMAIL_CONFIG.companyName}. We have successfully received your inquiry and are honored that you are considering us to facilitate your spiritual journey.
          </p>

          <div style="background-color: #fdfbf7; border: 1px solid #f3ead3; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #C9A84C; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Inquiry Details</p>
            <p style="margin: 0 0 8px 0; color: #111827; font-size: 15px;">
              <strong>Interest:</strong> ${packageTitle || journeyType || "Bespoke Itinerary"}
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 14px;">
              Our concierge team is currently reviewing your details to craft the best possible experience for you.
            </p>
          </div>

          <h3 style="color: #111827; font-size: 16px; margin-bottom: 15px;">What happens next?</h3>
          <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; padding-left: 20px; margin-bottom: 30px;">
            <li style="margin-bottom: 10px;">A dedicated travel concierge will review your requirements.</li>
            <li style="margin-bottom: 10px;">We will contact you within the next <strong>2 hours</strong> to discuss dates and preferences.</li>
            <li>We will provide a transparent, personalized quote for your journey.</li>
          </ul>

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Need immediate assistance?</p>
            <a href="https://wa.me/447445274723" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px;">
              Chat with us on WhatsApp
            </a>
          </div>
        </div>

        <div style="background-color: #051A14; padding: 30px; text-align: center;">
          <p style="color: #8ab5a0; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
            <strong>${EMAIL_CONFIG.companyName} Headquarters</strong><br>
            Flat 6, Din Buildings, Harehills Lane, Leeds, United Kingdom, LS8 3EG, UK<br>
            Direct: +44 7445 274723<br>
            Email: ${EMAIL_CONFIG.supportEmail}
          </p>
          <p style="color: #4b6659; font-size: 11px; margin: 0;">
            © ${EMAIL_CONFIG.year} ${EMAIL_CONFIG.companyName}. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: RESEND_HEADERS,
      body: JSON.stringify({
        from: EMAIL_CONFIG.from,
        to: inquiry.email,
        subject: `Inquiry Received — ${EMAIL_CONFIG.companyName}`,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Customer Email Error:", errorData);
    }
  } catch (error) {
    console.error("Customer Email Request Failed:", error);
  }
};