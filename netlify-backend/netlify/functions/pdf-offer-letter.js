// PDF Offer Letter Generation — Netlify Function (Premium Design)
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// ─── Color Palette ───
const COLORS = {
    navy: "#0F172A",
    navyLight: "#1E293B",
    gold: "#C29D59",
    goldLight: "#D4B87A",
    goldDark: "#A68542",
    white: "#FFFFFF",
    offWhite: "#FAFAF9",
    cream: "#FDF8F0",
    slate50: "#F8FAFC",
    slate100: "#F1F5F9",
    slate200: "#E2E8F0",
    slate400: "#94A3B8",
    slate500: "#64748B",
    slate700: "#334155",
    text: "#1E293B",
    success: "#059669",
};

const PW = 595.28; // A4 width
const PH = 842.89; // A4 height

/**
 * Draw a rounded rectangle (manually with bezier curves)
 */
function roundedRect(doc, x, y, w, h, r) {
    doc.moveTo(x + r, y)
        .lineTo(x + w - r, y)
        .quadraticCurveTo(x + w, y, x + w, y + r)
        .lineTo(x + w, y + h - r)
        .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        .lineTo(x + r, y + h)
        .quadraticCurveTo(x, y + h, x, y + h - r)
        .lineTo(x, y + r)
        .quadraticCurveTo(x, y, x + r, y)
        .closePath();
}

/**
 * Generate a premium branded Offer Letter PDF.
 * Returns { pdf: Buffer, letterId: string }
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
    const refId = letterId.slice(0, 8).toUpperCase();
    const date = issueDate || new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    // Generate QR code
    const verifyUrl = `${appUrl}/verify/${letterId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 150,
        margin: 1,
        color: { dark: COLORS.navy, light: COLORS.white },
        errorCorrectionLevel: "H",
    });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4", margin: 0, bufferPages: true,
            info: {
                Title: `Offer Letter — ${studentName}`,
                Author: "Unigate Consultancy",
                Subject: `Admission Offer for ${program} at ${collegeName}`,
                Creator: "Unigate Consultancy Management System",
            },
        });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve({ pdf: Buffer.concat(chunks), letterId }));
        doc.on("error", reject);

        const M = 50; // margin
        const CW = PW - 2 * M; // content width

        // ════════════════════════════════════════════════════
        // ─── DECORATIVE PAGE BORDER ───
        // ════════════════════════════════════════════════════
        // Outer gold border
        doc.rect(15, 15, PW - 30, PH - 30).lineWidth(1.5).strokeColor(COLORS.gold).stroke();
        // Inner navy thin border
        doc.rect(20, 20, PW - 40, PH - 40).lineWidth(0.5).strokeColor(COLORS.navyLight).stroke();
        // Corner accents (gold diamond shapes at corners)
        const cornerSize = 8;
        [[22, 22], [PW - 22, 22], [22, PH - 22], [PW - 22, PH - 22]].forEach(([cx, cy]) => {
            doc.save();
            doc.translate(cx, cy).rotate(45);
            doc.rect(-cornerSize / 2, -cornerSize / 2, cornerSize, cornerSize).fill(COLORS.gold);
            doc.restore();
        });

        // ════════════════════════════════════════════════════
        // ─── HEADER BAND ───
        // ════════════════════════════════════════════════════
        doc.rect(25, 25, PW - 50, 80).fill(COLORS.navy);
        // Gold accent line below header
        doc.rect(25, 105, PW - 50, 3).fill(COLORS.gold);

        // Logo text
        doc.font("Helvetica-Bold").fontSize(26).fillColor(COLORS.white)
            .text("UNIGATE", M + 5, 42, { continued: true })
            .fillColor(COLORS.gold).text(" CONSULTANCY");

        // Tagline
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.goldLight)
            .text("INTERNATIONAL EDUCATION & ADMISSIONS PARTNER", M + 5, 72, { characterSpacing: 2.5 });

        // Document reference on the right
        doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.slate400)
            .text(`Ref: UGC/${refId}`, PW - M - 120, 45, { width: 115, align: "right" });
        doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.slate400)
            .text(date, PW - M - 120, 57, { width: 115, align: "right" });

        // ════════════════════════════════════════════════════
        // ─── DIAGONAL WATERMARK ───
        // ════════════════════════════════════════════════════
        doc.save();
        doc.fontSize(90).fillColor(COLORS.slate200).opacity(0.08);
        doc.translate(PW / 2, PH / 2).rotate(-40);
        doc.text("UNIGATE", -220, -40);
        doc.restore();
        doc.opacity(1);

        // ════════════════════════════════════════════════════
        // ─── DOCUMENT TITLE ───
        // ════════════════════════════════════════════════════
        let y = 128;
        doc.font("Helvetica-Bold").fontSize(19).fillColor(COLORS.navy)
            .text("OFFICIAL OFFER OF ADMISSION", M, y, { align: "center", width: CW });
        y = doc.y + 4;
        // Gold underline accent (centered)
        const underlineW = 180;
        doc.rect((PW - underlineW) / 2, y, underlineW, 2).fill(COLORS.gold);
        // Thin decorative lines on either side
        doc.rect(M + 20, y + 0.5, (PW - underlineW) / 2 - M - 30, 0.5).fill(COLORS.slate200);
        doc.rect((PW + underlineW) / 2 + 10, y + 0.5, (PW - underlineW) / 2 - M - 30, 0.5).fill(COLORS.slate200);

        // ════════════════════════════════════════════════════
        // ─── STUDENT INFO CARD ───
        // ════════════════════════════════════════════════════
        y += 20;
        const cardH = 90;
        // Card background with subtle border
        roundedRect(doc, M, y, CW, cardH, 8);
        doc.fill(COLORS.cream);
        roundedRect(doc, M, y, CW, cardH, 8);
        doc.lineWidth(0.5).strokeColor(COLORS.goldLight).stroke();
        // Gold left accent bar
        doc.rect(M, y + 8, 4, cardH - 16).fill(COLORS.gold);

        const colLeft = M + 20;
        const colRight = M + CW / 2 + 10;
        const labelSpacing = 22;

        // Row 1
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate500)
            .text("Student Name", colLeft, y + 14);
        doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.navy)
            .text(studentName, colLeft, y + 26);

        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate500)
            .text("Application Reference", colRight, y + 14);
        doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.navy)
            .text(`UGC-${refId}`, colRight, y + 26);

        // Row 2
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate500)
            .text("Institution", colLeft, y + 50);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.navy)
            .text(collegeName, colLeft, y + 62);

        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate500)
            .text("Program & Intake", colRight, y + 50);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.navy)
            .text(`${program} — ${intakeYear}`, colRight, y + 62);

        // ════════════════════════════════════════════════════
        // ─── LETTER BODY ───
        // ════════════════════════════════════════════════════
        y += cardH + 22;
        doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
            .text(`Dear ${studentName},`, M, y, { width: CW, lineGap: 3 });

        y = doc.y + 10;
        doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
            .text(
                `We are delighted to inform you that your application for admission to ${collegeName} has been carefully reviewed and accepted. On behalf of the Unigate Consultancy team and the admissions board, we extend our heartfelt congratulations on this outstanding achievement.`,
                M, y, { width: CW, lineGap: 4 }
            );

        y = doc.y + 8;
        doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
            .text(
                `This letter serves as your Official Offer of Admission for the ${program} program for the ${intakeYear} academic year. We are confident that you will make a valuable contribution to the academic community.`,
                M, y, { width: CW, lineGap: 4 }
            );

        // ════════════════════════════════════════════════════
        // ─── ADMISSION DETAILS TABLE ───
        // ════════════════════════════════════════════════════
        y = doc.y + 18;
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.navy)
            .text("ADMISSION DETAILS", M, y);
        y = doc.y + 6;
        doc.rect(M, y, CW, 1).fill(COLORS.gold);
        y += 8;

        const tableData = [
            ["Program of Study", program],
            ["Academic Year", `${intakeYear} — ${intakeYear + 1}`],
            ["Partner Institution", collegeName],
            ["Total Program Fees", totalFees > 0 ? `₹ ${totalFees.toLocaleString("en-IN")}` : "As per institution"],
            ["Document Reference", `UGC/${refId}`],
            ["Date of Issue", date],
        ];

        // Table header
        roundedRect(doc, M, y, CW, 26, 4);
        doc.fill(COLORS.navy);
        doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.white);
        doc.text("DETAIL", M + 14, y + 8, { width: CW / 2 - 20 });
        doc.text("INFORMATION", M + CW / 2, y + 8, { width: CW / 2 - 14 });
        y += 26;

        // Table rows
        tableData.forEach(([key, value], i) => {
            const rowH = 24;
            const bg = i % 2 === 0 ? COLORS.slate50 : COLORS.white;
            const isLast = i === tableData.length - 1;

            if (isLast) {
                // Bottom rounded corners for last row
                doc.rect(M, y, CW, rowH).fill(bg);
            } else {
                doc.rect(M, y, CW, rowH).fill(bg);
            }

            // Left accent for fees row
            if (key === "Total Program Fees") {
                doc.rect(M, y, 3, rowH).fill(COLORS.gold);
            }

            doc.font("Helvetica").fontSize(9).fillColor(COLORS.slate500)
                .text(key, M + 14, y + 7, { width: CW / 2 - 20 });
            doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.navy)
                .text(value, M + CW / 2, y + 7, { width: CW / 2 - 14 });
            y += rowH;
        });

        // Bottom border of table
        doc.rect(M, y, CW, 1).fill(COLORS.slate200);

        // ════════════════════════════════════════════════════
        // ─── TERMS & CONDITIONS ───
        // ════════════════════════════════════════════════════
        y += 16;
        doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.navy)
            .text("TERMS & CONDITIONS", M, y);
        y = doc.y + 4;

        const terms = [
            "This offer is valid for thirty (30) days from the date of issue.",
            "Admission is subject to verification of original academic documents and transcripts.",
            "All applicable fees are payable as per the institution's prescribed payment schedule.",
            "Unigate Consultancy serves as an authorized admission and education partner.",
            "The institution reserves the right to withdraw this offer in case of misrepresentation.",
        ];

        terms.forEach((term, i) => {
            doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate700)
                .text(`${i + 1}.  ${term}`, M + 10, y, { width: CW - 20, lineGap: 2 });
            y = doc.y + 3;
        });

        // ════════════════════════════════════════════════════
        // ─── SIGNATURE & QR CODE SECTION ───
        // ════════════════════════════════════════════════════
        y += 10;
        doc.rect(M, y, CW, 0.5).fill(COLORS.slate200);
        y += 14;

        // Signature block (left side)
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate500)
            .text("Authorized Signatory", M, y);
        y = doc.y + 20;
        // Signature line
        doc.moveTo(M, y).lineTo(M + 180, y).lineWidth(0.8).strokeColor(COLORS.gold).stroke();
        y += 6;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.navy)
            .text("Unigate Consultancy", M, y);
        doc.font("Helvetica").fontSize(8).fillColor(COLORS.slate500)
            .text("Admissions Division", M, doc.y + 2);

        // QR Code block (right side)
        const qrSize = 65;
        const qrX = PW - M - qrSize - 10;
        const qrY = y - 32;
        // QR border
        roundedRect(doc, qrX - 6, qrY - 6, qrSize + 12, qrSize + 24, 6);
        doc.lineWidth(0.5).strokeColor(COLORS.slate200).stroke();
        doc.image(qrBuffer, qrX, qrY, { width: qrSize });
        doc.font("Helvetica").fontSize(6.5).fillColor(COLORS.slate400)
            .text("Scan to verify", qrX - 6, qrY + qrSize + 4, { width: qrSize + 12, align: "center" });

        // ════════════════════════════════════════════════════
        // ─── PREMIUM FOOTER ───
        // ════════════════════════════════════════════════════
        const footerY = PH - 55;
        doc.rect(25, footerY, PW - 50, 1).fill(COLORS.gold);
        doc.rect(25, footerY + 1, PW - 50, 28).fill(COLORS.navy);

        doc.font("Helvetica").fontSize(6.5).fillColor(COLORS.goldLight)
            .text("This is a digitally generated document by Unigate Consultancy Management System. No physical signature is required.", M, footerY + 6, { align: "center", width: CW });
        doc.font("Helvetica").fontSize(6).fillColor(COLORS.slate400)
            .text(`Document ID: ${letterId}  •  Verification: ${verifyUrl}`, M, footerY + 17, { align: "center", width: CW });

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

        const appUrl = process.env.APP_URL || "https://unigate-final-v3.vercel.app";
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
