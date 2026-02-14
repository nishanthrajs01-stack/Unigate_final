// Admission Confirmation Email — Netlify Function
// Equivalent to FastAPI POST /api/email/admission
const { sendEmail, getAdmissionEmail } = require("./utils/email-service");

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
        const { to_email, student_name, college_name, program } = JSON.parse(event.body || "{}");

        if (!to_email || !student_name || !college_name || !program) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ error: "to_email, student_name, college_name, and program are required" }),
            };
        }

        const { subject, html } = getAdmissionEmail(student_name, college_name, program);
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
