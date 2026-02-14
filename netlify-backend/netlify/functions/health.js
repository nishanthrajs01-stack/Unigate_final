// Health Check — Netlify Function
exports.handler = async () => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            status: "ok",
            service: "UCMS API",
            version: "2.0.0",
            platform: "Netlify Functions",
            timestamp: new Date().toISOString(),
        }),
    };
};
