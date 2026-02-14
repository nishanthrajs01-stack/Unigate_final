"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Application, type Profile, type Document as DocType, STATUS_LABELS } from "@/lib/supabase";
import { formatCurrency, formatDate, API_URL } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [application, setApplication] = useState<Application & { profile?: Profile } | null>(null);
    const [documents, setDocuments] = useState<DocType[]>([]);
    const [loading, setLoading] = useState(true);
    const [appId, setAppId] = useState<string>("");
    const supabase = createClient();

    useEffect(() => {
        params.then((p) => setAppId(p.id));
    }, [params]);

    const fetchData = useCallback(async () => {
        if (!appId) return;

        const { data: appData } = await supabase
            .from("applications")
            .select("*, profile:profiles!applications_user_id_fkey(*), college:colleges(*)")
            .eq("id", appId)
            .single();

        if (appData) {
            setApplication(appData as Application & { profile?: Profile });

            const { data: docs } = await supabase
                .from("documents")
                .select("*")
                .eq("application_id", appId)
                .order("created_at", { ascending: false });

            if (docs) setDocuments(docs as DocType[]);
        }
        setLoading(false);
    }, [supabase, appId]);

    useEffect(() => {
        if (appId) fetchData();
    }, [appId, fetchData]);

    const handleStatusChange = async (newStatus: string) => {
        if (!application) return;
        const { error } = await supabase
            .from("applications")
            .update({ status: newStatus })
            .eq("id", application.id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`Status updated to ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}`);
            fetchData();

            // Auto-generate and download offer letter when student is admitted
            if (newStatus === "admitted") {
                toast.info("Generating offer letter...");
                // Small delay to let the UI update first
                setTimeout(() => handleGenerateOfferLetter(), 500);
            }

            // Send email notification to student
            if (application.profile?.email) {
                try {
                    // Don't await strictly to keep UI responsive, but nice to know if it fails
                    fetch(`${API_URL}/api/email/status-change`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to_email: application.profile.email,
                            student_name: application.profile.full_name,
                            new_status: newStatus,
                            college_name: application.college?.name,
                            program: application.program,
                        }),
                    }).then(res => {
                        if (res.ok) toast.success("Email notification sent to student");
                        else console.error("Email API error");
                    });
                } catch (err) {
                    console.error("Failed to send email:", err);
                }
            }
        }
    };

    const handleGenerateOfferLetter = async () => {
        if (!application?.profile) return;

        try {
            const res = await fetch(`${API_URL}/api/pdf/offer-letter-download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_name: application.profile.full_name,
                    college_name: application.college?.name || "Partner University",
                    program: application.program || "General Program",
                    intake_year: application.intake_year || 2025,
                    total_fees: application.total_fees,
                }),
            });

            if (!res.ok) throw new Error("Generation failed");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${application.profile.full_name.replace(/\s+/g, "_")}_Offer_Letter.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Offer letter generated and downloaded!");
        } catch {
            toast.error("Failed to generate offer letter. Is the backend running?");
        }
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "300px", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
            </div>
        );
    }

    if (!application) {
        return (
            <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                <h2 style={{ color: "#0f172a", fontWeight: 700 }}>Application Not Found</h2>
                <a href="/admin" style={{ color: "#c29d59", textDecoration: "none", fontWeight: 600 }}>← Back to Dashboard</a>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                <div>
                    <a href="/admin" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.813rem", fontWeight: 500 }}>
                        ← Back to Students
                    </a>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginTop: "8px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                        {application.profile?.full_name || "Student"}
                    </h1>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleGenerateOfferLetter}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(135deg, #c29d59, #d4b87a)",
                            color: "#0f172a",
                            fontSize: "0.813rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 8px rgba(194,157,89,0.3)",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        📄 Generate Offer Letter
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                {/* Main Content */}
                <div>
                    {/* Student Info */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
                            👤 Profile
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Email</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{application.profile?.email}</p>
                            </div>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Phone</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{application.profile?.phone || "Not provided"}</p>
                            </div>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Stream</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>{application.stream || "—"}</p>
                            </div>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Program</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{application.program || "—"}</p>
                            </div>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>College</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{application.college?.name || "Not assigned"}</p>
                            </div>
                            <div>
                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Applied On</p>
                                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{formatDate(application.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
                            📁 Documents ({documents.length})
                        </h2>
                        {documents.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                                <p>No documents uploaded yet</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "14px 18px",
                                            borderRadius: "10px",
                                            background: "#f8fafc",
                                            border: "1px solid #f1f5f9",
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{doc.doc_type}</p>
                                            <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{doc.original_name}</p>
                                        </div>
                                        <span className={`status-badge status-${doc.status}`}>
                                            {doc.status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Status Card */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "0.938rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Status</h3>
                        <span className={`status-badge status-${application.status}`} style={{ fontSize: "0.875rem", padding: "6px 16px" }}>
                            {STATUS_LABELS[application.status]}
                        </span>
                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {["pending", "under_review", "verified", "college_allocated", "admitted", "rejected"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={application.status === s}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        border: application.status === s ? "2px solid #c29d59" : "1px solid #e2e8f0",
                                        background: application.status === s ? "#fef8ee" : "#ffffff",
                                        color: application.status === s ? "#c29d59" : "#64748b",
                                        fontSize: "0.75rem",
                                        fontWeight: application.status === s ? 600 : 400,
                                        cursor: application.status === s ? "default" : "pointer",
                                        textAlign: "left",
                                        transition: "all 0.2s",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {STATUS_LABELS[s as keyof typeof STATUS_LABELS] || s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fee Card */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: "0.938rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>💰 Fee Summary</h3>
                        <div style={{ marginBottom: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.813rem" }}>Paid</span>
                                <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.813rem" }}>{formatCurrency(application.paid_fees)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.813rem" }}>Total</span>
                                <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.813rem" }}>{formatCurrency(application.total_fees)}</span>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${application.total_fees > 0 ? Math.min(100, (application.paid_fees / application.total_fees) * 100) : 0}%`,
                                        background: "linear-gradient(90deg, #10b981, #34d399)",
                                        borderRadius: "3px",
                                        transition: "width 0.3s",
                                    }}
                                />
                            </div>
                        </div>
                        <p style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600 }}>
                            Balance: {formatCurrency(application.total_fees - application.paid_fees)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
