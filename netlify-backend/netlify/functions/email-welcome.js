// Welcome Email — Netlify Function
// Equivalent to FastAPI POST /api/email/welcome
const { sendEmail, getWelcomeEmail } = require("./utils/email-service");

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders(), body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        const { to_email, student_name } = JSON.parse(event.body || "{}");

        if (!to_email || !student_name) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ error: "to_email and student_name are required" }),
            };
        }

        const { subject, html } = getWelcomeEmail(student_name);
        const result = await sendEmail(to_email, subject, html);

        if (!result.success) {
            return {
                statusCode: 500,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ success: false, error: result.error }),
            };
        }

        return {
            statusCode: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: result.message }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, error: err.message }),
        };
    }
};
