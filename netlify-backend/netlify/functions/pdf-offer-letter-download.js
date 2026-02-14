// PDF Offer Letter Download — Netlify Function
// Equivalent to FastAPI POST /api/pdf/offer-letter/download
const { generateOfferLetterPDF } = require("./pdf-offer-letter");

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
        const body = JSON.parse(event.body || "{}");
        const {
            student_name, college_name, program,
            intake_year = 2025, total_fees = 0, issue_date = null,
        } = body;

        if (!student_name || !college_name || !program) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ error: "student_name, college_name, and program are required" }),
            };
        }

        const appUrl = process.env.APP_URL || "http://localhost:3000";
        const { pdf, letterId } = await generateOfferLetterPDF({
            studentName: student_name,
            collegeName: college_name,
            program,
            intakeYear: intake_year,
            totalFees: total_fees,
            issueDate: issue_date,
            appUrl,
        });

        const filename = `${student_name.replace(/\s+/g, "_")}_Offer_Letter.pdf`;

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders(),
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "X-Letter-ID": letterId,
            },
            body: pdf.toString("base64"),
            isBase64Encoded: true,
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ error: `PDF generation failed: ${err.message}` }),
        };
    }
};
