"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type OfferLetter } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { use } from "react";

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [letter, setLetter] = useState<OfferLetter | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const supabase = createClient();

    const fetchLetter = useCallback(async () => {
        const { data, error } = await supabase
            .from("offer_letters")
            .select("*")
            .eq("id", resolvedParams.id)
            .single();

        if (error || !data) {
            setNotFound(true);
        } else {
            setLetter(data as OfferLetter);
        }
        setLoading(false);
    }, [supabase, resolvedParams.id]);

    useEffect(() => {
        fetchLetter();
    }, [fetchLetter]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTop: "4px solid #c29d59", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ color: "#64748b" }}>Verifying document...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div className="animate-fade-in" style={{ maxWidth: "500px", width: "100%" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "2px", fontFamily: "'Playfair Display', serif" }}>
                        UNIGATE
                    </h1>
                    <div style={{ width: "40px", height: "2px", background: "#c29d59", margin: "6px auto" }} />
                    <p style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase" }}>
                        Document Verification
                    </p>
                </div>

                <div style={{ background: "#ffffff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
                    {notFound ? (
                        <div style={{ padding: "48px 32px", textAlign: "center" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.5rem" }}>
                                ❌
                            </div>
                            <h2 style={{ color: "#b91c1c", fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                                Invalid Document
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                                This document could not be verified. It may be expired or invalid.
                            </p>
                            <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "16px" }}>
                                Reference: {resolvedParams.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    ) : letter && letter.is_valid ? (
                        <>
                            {/* Green header */}
                            <div style={{ background: "linear-gradient(135deg, #059669, #10b981)", padding: "28px", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#ffffff30", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "1.5rem" }}>
                                    ✅
                                </div>
                                <h2 style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 4px" }}>
                                    Document Verified
                                </h2>
                                <p style={{ color: "#d1fae5", fontSize: "0.813rem" }}>
                                    This is an authentic Unigate Consultancy document
                                </p>
                            </div>
                            <div style={{ padding: "28px" }}>
                                <div style={{ display: "grid", gap: "16px" }}>
                                    <div>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Student Name</p>
                                        <p style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 700 }}>{letter.student_name}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Institution</p>
                                        <p style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 700 }}>{letter.college_name}</p>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Program</p>
                                            <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{letter.program || "—"}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Issue Date</p>
                                            <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{formatDate(letter.issue_date)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "24px", padding: "14px 18px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                                    <p style={{ color: "#065f46", fontSize: "0.75rem", fontWeight: 500 }}>
                                        Document ID: {letter.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: "48px 32px", textAlign: "center" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.5rem" }}>
                                ⚠️
                            </div>
                            <h2 style={{ color: "#92400e", fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                                Document Revoked
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                                This document has been revoked and is no longer valid.
                            </p>
                        </div>
                    )}
                </div>

                <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.75rem", color: "#94a3b8" }}>
                    © 2024 Unigate Consultancy. All rights reserved.
                </p>
            </div>
        </div>
    );
}
