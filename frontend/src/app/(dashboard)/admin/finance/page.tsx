"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Application } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function FinancePage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const { data } = await supabase
            .from("applications")
            .select("*, college:colleges(name)")
            .order("created_at", { ascending: false });

        if (data) setApplications(data as Application[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate financials
    const totalRevenue = applications.reduce((sum, a) => sum + (a.paid_fees || 0), 0);
    const totalOutstanding = applications.reduce(
        (sum, a) => sum + Math.max(0, (a.total_fees || 0) - (a.paid_fees || 0)),
        0
    );
    const totalFees = applications.reduce((sum, a) => sum + (a.total_fees || 0), 0);
    const collectionRate = totalFees > 0 ? Math.round((totalRevenue / totalFees) * 100) : 0;

    // Group by stream
    const streamData = applications.reduce(
        (acc, app) => {
            const stream = app.stream || "Other";
            if (!acc[stream]) acc[stream] = { total: 0, paid: 0, count: 0 };
            acc[stream].total += app.total_fees || 0;
            acc[stream].paid += app.paid_fees || 0;
            acc[stream].count += 1;
            return acc;
        },
        {} as Record<string, { total: number; paid: number; count: number }>
    );

    // Group by status
    const statusPayments = applications.reduce(
        (acc, app) => {
            const status = app.status || "unknown";
            if (!acc[status]) acc[status] = { total: 0, paid: 0, count: 0 };
            acc[status].total += app.total_fees || 0;
            acc[status].paid += app.paid_fees || 0;
            acc[status].count += 1;
            return acc;
        },
        {} as Record<string, { total: number; paid: number; count: number }>
    );

    const streamColors: Record<string, string> = {
        engineering: "#3b82f6",
        medical: "#ef4444",
        business: "#f59e0b",
        arts: "#8b5cf6",
        science: "#10b981",
        Other: "#64748b",
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "280px", marginBottom: "24px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "14px" }} />
                    ))}
                </div>
                <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                    💰 Financial Oversight
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Track revenue, outstanding dues, and payment trends
                </p>
            </div>

            {/* Key Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <div
                    style={{
                        background: "linear-gradient(135deg, #0f172a, #1e293b)",
                        borderRadius: "16px",
                        padding: "28px",
                        color: "#ffffff",
                    }}
                >
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Total Revenue Collected
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#c29d59" }}>
                        {formatCurrency(totalRevenue)}
                    </p>
                    <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "8px" }}>
                        From {applications.length} applications
                    </p>
                </div>
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Outstanding Balance
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#f59e0b" }}>
                        {formatCurrency(totalOutstanding)}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "8px" }}>
                        Pending collection
                    </p>
                </div>
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Collection Rate
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: collectionRate >= 70 ? "#10b981" : "#f59e0b" }}>
                        {collectionRate}%
                    </p>
                    {/* Progress bar */}
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", marginTop: "12px", overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${collectionRate}%`,
                                background: collectionRate >= 70 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                                borderRadius: "3px",
                                transition: "width 0.5s",
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Revenue by Stream */}
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>
                        📊 Revenue by Stream
                    </h2>
                    {Object.keys(streamData).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                            <p>No data available</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {Object.entries(streamData).map(([stream, data]) => (
                                <div key={stream}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", textTransform: "capitalize" }}>
                                            {stream}
                                        </span>
                                        <span style={{ fontSize: "0.813rem", color: "#64748b" }}>
                                            {formatCurrency(data.paid)} / {formatCurrency(data.total)}
                                        </span>
                                    </div>
                                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${data.total > 0 ? (data.paid / data.total) * 100 : 0}%`,
                                                background: streamColors[stream] || "#64748b",
                                                borderRadius: "4px",
                                                transition: "width 0.5s",
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: "0.688rem", color: "#94a3b8", marginTop: "4px" }}>
                                        {data.count} student{data.count !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Revenue by Status */}
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>
                        📋 Revenue by Status
                    </h2>
                    {Object.keys(statusPayments).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                            <p>No data available</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Object.entries(statusPayments).map(([status, data]) => (
                                <div
                                    key={status}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "14px 18px",
                                        borderRadius: "10px",
                                        background: "#f8fafc",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span className={`status-badge status-${status}`}>
                                            {status.replace(/_/g, " ")}
                                        </span>
                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                            ({data.count})
                                        </span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                            {formatCurrency(data.paid)}
                                        </p>
                                        <p style={{ fontSize: "0.688rem", color: "#94a3b8", margin: 0 }}>
                                            of {formatCurrency(data.total)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* All Payments Table */}
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", marginTop: "24px" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                        📑 Fee Breakdown by Student
                    </h2>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Student</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Total Fees</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Paid</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>
                                        {app.user_id?.slice(0, 8)}...
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span className={`status-badge status-${app.status}`}>{app.status.replace(/_/g, " ")}</span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>
                                        {formatCurrency(app.total_fees)}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.875rem", color: "#10b981", fontWeight: 600 }}>
                                        {formatCurrency(app.paid_fees)}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.875rem", color: app.total_fees - app.paid_fees > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                                        {formatCurrency(app.total_fees - app.paid_fees)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
