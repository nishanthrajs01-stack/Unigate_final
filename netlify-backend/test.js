// Quick verification test for Netlify Functions
async function test() {
    console.log("=== UCMS Netlify Functions Test ===\n");

    // 1. Health check
    const health = require("./netlify/functions/health.js");
    const hRes = await health.handler({ httpMethod: "GET" });
    console.log("1. Health:", hRes.statusCode, JSON.parse(hRes.body).status);

    // 2. PDF generation
    const pdf = require("./netlify/functions/pdf-offer-letter.js");
    const pRes = await pdf.handler({
        httpMethod: "POST",
        body: JSON.stringify({
            student_name: "Test Student",
            college_name: "MIT",
            program: "Computer Science",
        }),
    });
    const pBody = JSON.parse(pRes.body);
    console.log("2. PDF Generate:", pRes.statusCode, pBody.letter_id ? "ID=" + pBody.letter_id.slice(0, 8) : pBody.error);

    // 3. PDF download
    const pdfDl = require("./netlify/functions/pdf-offer-letter-download.js");
    const dRes = await pdfDl.handler({
        httpMethod: "POST",
        body: JSON.stringify({
            student_name: "Test Student",
            college_name: "MIT",
            program: "Computer Science",
        }),
    });
    console.log("3. PDF Download:", dRes.statusCode, dRes.isBase64Encoded ? "base64 size=" + dRes.body.length : "ERROR");

    // 4. CORS preflight
    const email = require("./netlify/functions/email-welcome.js");
    const cRes = await email.handler({ httpMethod: "OPTIONS" });
    console.log("4. CORS Preflight:", cRes.statusCode);

    // 5. Email validation (no SMTP, should fail gracefully)
    const eRes = await email.handler({
        httpMethod: "POST",
        body: JSON.stringify({ to_email: "test@test.com", student_name: "Test" }),
    });
    const eBody = JSON.parse(eRes.body);
    console.log("5. Email (no SMTP):", eRes.statusCode, eBody.error || eBody.message);

    // 6. Input validation
    const vRes = await pdf.handler({
        httpMethod: "POST",
        body: JSON.stringify({}),
    });
    console.log("6. Validation:", vRes.statusCode, JSON.parse(vRes.body).error);

    console.log("\n=== All tests completed ===");
}

test().catch(console.error);
