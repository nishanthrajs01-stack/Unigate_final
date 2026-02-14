// PDF Offer Letter Generation — Netlify Function
// Equivalent to FastAPI POST /api/pdf/offer-letter
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate a branded Offer Letter PDF with watermark and QR code.
 * Returns a Buffer containing the PDF.
 */
async function generateOfferLetterPDF({
    studentName,
    collegeName,
    program,
    intakeYear = 2025,
    totalFees = 0,
    issueDate = null,
    appUrl = "http://localhost:3000",
}) {
    const letterId = uuidv4();
    const date = issueDate || new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    // Generate QR code as data URL
    const verifyUrl = `${appUrl}/verify/${letterId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 120,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
    });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve({ pdf: Buffer.concat(chunks), letterId }));
        doc.on("error", reject);

        // ─── Header ───
        doc.rect(0, 0, 595, 55).fill("#0F172A");
        doc.rect(0, 55, 595, 3).fill("#C29D59");

        doc.font("Helvetica-Bold").fontSize(22).fillColor("#FFFFFF")
            .text("UNIGATE CONSULTANCY", 50, 15, { continued: false });
        doc.font("Helvetica").fontSize(9).fillColor("#C29D59")
            .text("International Education & Admissions Partner", 50, 38);

        // ─── Watermark ───
        doc.save();
        doc.fontSize(70).fillColor("#F0F0F5").opacity(0.15);
        doc.translate(297, 420).rotate(-45);
        doc.text("UNIGATE", -200, -30);
        doc.restore();
        doc.opacity(1);

        // ─── Date ───
        doc.font("Helvetica").fontSize(10).fillColor("#64748B")
            .text(`Date: ${date}`, 50, 80, { align: "right", width: 495 });

        // ─── Title ───
        doc.moveDown(1);
        doc.font("Helvetica-Bold").fontSize(18).fillColor("#0F172A")
            .text("OFFICIAL OFFER OF ADMISSION", { align: "center" });
        const titleY = doc.y;
        doc.rect(220, titleY + 5, 155, 2).fill("#C29D59");

        // ─── Student Info Box ───
        doc.moveDown(2);
        const boxY = doc.y;
        doc.rect(50, boxY, 495, 80).fill("#F8FAFC");

        doc.font("Helvetica").fontSize(10).fillColor("#64748B")
            .text("Student Name:", 60, boxY + 10);
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#0F172A")
            .text(studentName, 160, boxY + 9);

        doc.font("Helvetica").fontSize(10).fillColor("#64748B")
            .text("Institution:", 60, boxY + 32);
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#0F172A")
            .text(collegeName, 160, boxY + 31);

        doc.font("Helvetica").fontSize(10).fillColor("#64748B")
            .text("Program:", 60, boxY + 54);
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#0F172A")
            .text(`${program} — Intake ${intakeYear}`, 160, boxY + 53);

        // ─── Body ───
        doc.y = boxY + 95;
        doc.font("Helvetica").fontSize(11).fillColor("#1E293B")
            .text(
                `Dear ${studentName},\n\nWe are pleased to inform you that your application for admission to ${collegeName} has been reviewed and accepted. This letter serves as your official Offer of Admission for the ${program} program for the ${intakeYear} academic intake.\n\nPlease find the key details of your admission below:`,
                50, doc.y, { width: 495, lineGap: 4 }
            );

        // ─── Details Table ───
        doc.moveDown(1);
        const tableData = [
            ["Program of Study", program],
            ["Academic Year", String(intakeYear)],
            ["Institution", collegeName],
            ["Total Program Fees", `INR ${totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
            ["Document Reference", letterId.slice(0, 8).toUpperCase()],
        ];

        // Header row
        const tableX = 50;
        let tableY = doc.y;
        doc.rect(tableX, tableY, 495, 25).fill("#0F172A");
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#FFFFFF");
        doc.text("  Detail", tableX + 5, tableY + 7, { width: 240 });
        doc.text("  Value", tableX + 250, tableY + 7, { width: 240 });
        tableY += 25;

        // Data rows
        tableData.forEach(([key, value], i) => {
            const bg = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
            doc.rect(tableX, tableY, 495, 22).fill(bg);
            doc.font("Helvetica").fontSize(10).fillColor("#64748B")
                .text(`  ${key}`, tableX + 5, tableY + 5, { width: 240 });
            doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A")
                .text(`  ${value}`, tableX + 250, tableY + 5, { width: 240 });
            tableY += 22;
        });

        // ─── Terms ───
        doc.y = tableY + 15;
        doc.font("Helvetica").fontSize(10).fillColor("#1E293B")
            .text(
                "Terms & Conditions:\n1. This offer is valid for 30 days from the date of issue.\n2. Admission is subject to verification of original academic documents.\n3. Fees are payable as per the institution's payment schedule.\n4. Unigate Consultancy acts as an authorized admission partner.",
                50, doc.y, { width: 495, lineGap: 3 }
            );

        // ─── QR Code ───
        doc.moveDown(1.5);
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#0F172A")
            .text("Scan to verify this document:", 50, doc.y);
        doc.image(qrBuffer, 460, doc.y - 15, { width: 70 });

        // ─── Signature ───
        doc.moveDown(4);
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#0F172A")
            .text("Authorized by Unigate Consultancy", 50);
        doc.moveTo(50, doc.y + 2).lineTo(250, doc.y + 2).strokeColor("#C29D59").stroke();

        // ─── Footer ───
        const pageH = doc.page.height;
        doc.rect(0, pageH - 40, 595, 1).fill("#C29D59");
        doc.font("Helvetica").fontSize(7).fillColor("#94A3B8")
            .text("This document is computer-generated and does not require a physical signature.", 50, pageH - 35, { align: "center", width: 495 })
            .text(`Verify: ${verifyUrl}  |  Document ID: ${letterId}`, 50, pageH - 25, { align: "center", width: 495 });

        doc.end();
    });
}

// ─── CORS helper ───
function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

// ─── Handler: POST /api/pdf/offer-letter ───
exports.handler = async (event) => {
    // Handle CORS preflight
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
        const { letterId } = await generateOfferLetterPDF({
            studentName: student_name,
            collegeName: college_name,
            program,
            intakeYear: intake_year,
            totalFees: total_fees,
            issueDate: issue_date,
            appUrl,
        });

        return {
            statusCode: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({
                letter_id: letterId,
                message: "Offer letter generated successfully",
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ error: `PDF generation failed: ${err.message}` }),
        };
    }
};

// Export for reuse
module.exports.generateOfferLetterPDF = generateOfferLetterPDF;
