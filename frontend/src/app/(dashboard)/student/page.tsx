"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Application, type Profile, STATUS_LABELS, STATUS_STEPS } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDashboard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileData) setProfile(profileData as Profile);

        const { data: appData } = await supabase
            .from("applications")
            .select("*, college:colleges(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (appData) setApplication(appData as Application);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentStepIndex = application
        ? STATUS_STEPS.indexOf(application.status)
        : 0;

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "250px", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "140px", marginBottom: "16px", borderRadius: "12px" }} />
                <div className="skeleton" style={{ height: "200px", borderRadius: "12px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "4px",
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    }}
                >
                    Welcome back, {profile?.full_name?.split(" ")[0] || "Student"} 👋
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Track your application journey and manage your documents
                </p>
            </div>

            {/* Quick Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "32px",
                }}
            >
                {[
                    {
                        label: "Application Status",
                        value: application ? STATUS_LABELS[application.status] : "Not Started",
                        color: "#3b82f6",
                        bg: "#eff6ff",
                        icon: "📋",
                    },
                    {
                        label: "College",
                        value: application?.college?.name || "Not Assigned",
                        color: "#8b5cf6",
                        bg: "#f5f3ff",
                        icon: "🏫",
                    },
                    {
                        label: "Total Fees",
                        value: application ? formatCurrency(application.total_fees) : "—",
                        color: "#059669",
                        bg: "#ecfdf5",
                        icon: "💰",
                    },
                    {
                        label: "Balance Due",
                        value: application
                            ? formatCurrency(application.total_fees - application.paid_fees)
                            : "—",
                        color: application && application.total_fees - application.paid_fees > 0 ? "#f59e0b" : "#10b981",
                        bg: application && application.total_fees - application.paid_fees > 0 ? "#fffbeb" : "#ecfdf5",
                        icon: "📊",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            background: "#ffffff",
                            borderRadius: "14px",
                            padding: "22px",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s",
                            cursor: "default",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    background: stat.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                }}
                            >
                                {stat.icon}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                                {stat.label}
                            </span>
                        </div>
                        <p style={{ fontSize: "1.125rem", fontWeight: 700, color: stat.color, margin: 0 }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Application Timeline */}
            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "24px",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "28px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    🗺️ Application Journey
                </h2>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                    {/* Progress line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "20px",
                            right: "20px",
                            height: "3px",
                            background: "#e2e8f0",
                            borderRadius: "2px",
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #c29d59, #d4b87a)",
                                borderRadius: "2px",
                                transition: "width 0.5s ease",
                            }}
                        />
                    </div>

                    {STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                            <div
                                key={step}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    flex: 1,
                                    position: "relative",
                                }}
                            >
                                <div
                                    className={isCurrent ? "animate-pulse-gold" : ""}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        background: isCompleted
                                            ? "linear-gradient(135deg, #c29d59, #d4b87a)"
                                            : "#f1f5f9",
                                        color: isCompleted ? "#0f172a" : "#94a3b8",
                                        border: isCurrent ? "3px solid #c29d59" : isCompleted ? "none" : "2px solid #e2e8f0",
                                        transition: "all 0.3s",
                                        zIndex: 1,
                                    }}
                                >
                                    {isCompleted ? "✓" : index + 1}
                                </div>
                                <p
                                    style={{
                                        marginTop: "10px",
                                        fontSize: "0.688rem",
                                        fontWeight: isCurrent ? 700 : 500,
                                        color: isCompleted ? "#0f172a" : "#94a3b8",
                                        textAlign: "center",
                                        lineHeight: "1.3",
                                    }}
                                >
                                    {STATUS_LABELS[step]}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                }}
            >
                <a
                    href="/student/application"
                    style={{
                        background: "linear-gradient(135deg, #0f172a, #1e293b)",
                        color: "#ffffff",
                        textDecoration: "none",
                        borderRadius: "14px",
                        padding: "24px",
                        transition: "all 0.3s",
                        display: "block",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(15,23,42,0.3)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>📝</div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>
                        {application ? "Continue Application" : "Start Application"}
                    </h3>
                    <p style={{ fontSize: "0.813rem", color: "#94a3b8" }}>
                        {application
                            ? "Review and update your application details"
                            : "Begin your admission journey today"}
                    </p>
                </a>

                <a
                    href="/student/documents"
                    style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        textDecoration: "none",
                        borderRadius: "14px",
                        padding: "24px",
                        transition: "all 0.3s",
                        display: "block",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                        e.currentTarget.style.borderColor = "#c29d59";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                >
                    <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>📁</div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>
                        Document Vault
                    </h3>
                    <p style={{ fontSize: "0.813rem", color: "#64748b" }}>
                        Upload & manage your academic documents
                    </p>
                </a>
            </div>

            {/* Recent Activity */}
            {application && (
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "28px",
                        border: "1px solid #e2e8f0",
                        marginTop: "24px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "20px",
                        }}
                    >
                        📋 Application Details
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <div>
                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "4px" }}>Stream</p>
                            <p style={{ color: "#0f172a", fontWeight: 600 }}>{application.stream || "Not specified"}</p>
                        </div>
                        <div>
                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "4px" }}>Program</p>
                            <p style={{ color: "#0f172a", fontWeight: 600 }}>{application.program || "Not specified"}</p>
                        </div>
                        <div>
                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "4px" }}>Intake Year</p>
                            <p style={{ color: "#0f172a", fontWeight: 600 }}>{application.intake_year || "Not specified"}</p>
                        </div>
                        <div>
                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "4px" }}>Applied On</p>
                            <p style={{ color: "#0f172a", fontWeight: 600 }}>{formatDate(application.created_at)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
