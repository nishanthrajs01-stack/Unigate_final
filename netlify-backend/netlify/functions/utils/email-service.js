// Shared email service — Netlify Functions
// Replicates FastAPI email_service.py logic using Nodemailer
const nodemailer = require("nodemailer");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

// ─── Branded HTML Template ───
function getBaseTemplate(content, title = "Unigate Consultancy") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:30px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:1px;">UNIGATE</h1>
              <p style="color:#c29d59;margin:5px 0 0;font-size:12px;letter-spacing:2px;">CONSULTANCY</p>
            </td>
          </tr>
          <!-- Gold accent -->
          <tr><td style="background-color:#c29d59;height:3px;"></td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:25px 40px;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
                &copy; 2025 Unigate Consultancy. All rights reserved.<br>
                <a href="${APP_URL}" style="color:#c29d59;text-decoration:none;">Visit Portal</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email Templates ───
function getWelcomeEmail(studentName) {
    const subject = "Welcome to Unigate Consultancy — Your Journey Begins!";
    const content = `
    <h2 style="color:#0f172a;margin:0 0 20px;">Welcome, ${studentName}! 🎓</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;">
      We're thrilled to have you on board. Unigate Consultancy is your trusted partner
      for international education and admissions.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.7;">Here's what to do next:</p>
    <ol style="color:#475569;font-size:15px;line-height:2;">
      <li>Complete your profile information</li>
      <li>Upload your academic documents</li>
      <li>Submit your application for review</li>
    </ol>
    <div style="text-align:center;margin:30px 0;">
      <a href="${APP_URL}/student"
         style="background-color:#0f172a;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
        Go to Dashboard →
      </a>
    </div>
    <p style="color:#94a3b8;font-size:13px;">
      If you have any questions, feel free to reach out to your assigned counselor.
    </p>`;
    return { subject, html: getBaseTemplate(content, subject) };
}

function getStatusChangeEmail(studentName, newStatus, notes = "") {
    const statusColors = {
        pending: "#f59e0b",
        under_review: "#3b82f6",
        verified: "#10b981",
        college_allocated: "#8b5cf6",
        admitted: "#059669",
        rejected: "#ef4444",
    };
    const color = statusColors[newStatus] || "#64748b";
    const displayStatus = newStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const subject = `Application Update — Status: ${displayStatus}`;
    const content = `
    <h2 style="color:#0f172a;margin:0 0 20px;">Application Status Update</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;">
      Dear ${studentName}, your application status has been updated:
    </p>
    <div style="text-align:center;margin:25px 0;padding:20px;background-color:#f8fafc;border-radius:10px;border-left:4px solid ${color};">
      <p style="color:#64748b;font-size:12px;margin:0 0 5px;text-transform:uppercase;letter-spacing:1px;">Current Status</p>
      <p style="color:${color};font-size:22px;font-weight:700;margin:0;">${displayStatus}</p>
    </div>
    ${notes ? `<p style="color:#475569;font-size:14px;background:#fffbeb;padding:12px 16px;border-radius:6px;border-left:3px solid #f59e0b;"><strong>Note:</strong> ${notes}</p>` : ""}
    <div style="text-align:center;margin:30px 0;">
      <a href="${APP_URL}/student"
         style="background-color:#0f172a;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
        View Details →
      </a>
    </div>`;
    return { subject, html: getBaseTemplate(content, subject) };
}

function getAdmissionEmail(studentName, collegeName, program) {
    const subject = `🎉 Congratulations! Admission Confirmed — ${collegeName}`;
    const content = `
    <div style="text-align:center;margin-bottom:25px;"><span style="font-size:48px;">🎓</span></div>
    <h2 style="color:#0f172a;margin:0 0 20px;text-align:center;">Congratulations, ${studentName}!</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;text-align:center;">
      We are delighted to inform you that your admission has been <strong style="color:#059669;">confirmed</strong>!
    </p>
    <div style="margin:25px 0;padding:25px;background:linear-gradient(135deg,#f0fdf4,#f8fafc);border-radius:12px;border:1px solid #bbf7d0;">
      <table width="100%" style="font-size:14px;color:#475569;">
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#0f172a;">Institution</td>
          <td style="padding:8px 0;">${collegeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#0f172a;">Program</td>
          <td style="padding:8px 0;">${program}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#0f172a;">Status</td>
          <td style="padding:8px 0;"><span style="background:#059669;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;">ADMITTED</span></td>
        </tr>
      </table>
    </div>
    <p style="color:#475569;font-size:15px;line-height:1.7;">
      Your official Offer Letter will be available for download on your student portal.
      Please check your dashboard for next steps regarding fee payment and document submission.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${APP_URL}/student"
         style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(15,23,42,0.3);">
        View Your Offer Letter →
      </a>
    </div>`;
    return { subject, html: getBaseTemplate(content, subject) };
}

// ─── Send Email ───
async function sendEmail(toEmail, subject, htmlContent) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpUser || !smtpPassword) {
        return { success: false, error: "SMTP credentials not configured" };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: smtpUser, pass: smtpPassword },
    });

    try {
        await transporter.sendMail({
            from: `"Unigate Consultancy" <${smtpUser}>`,
            to: toEmail,
            subject,
            html: htmlContent,
        });
        return { success: true, message: `Email sent to ${toEmail}` };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendEmail,
    getWelcomeEmail,
    getStatusChangeEmail,
    getAdmissionEmail,
};
