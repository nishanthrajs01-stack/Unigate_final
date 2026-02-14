"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Application, type Profile, STATUS_LABELS } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDashboard() {
    const [applications, setApplications] = useState<(Application & { profile?: Profile })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterStream, setFilterStream] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    const fetchApplications = useCallback(async () => {
        let query = supabase
            .from("applications")
            .select("*, profile:profiles!applications_user_id_fkey(*), college:colleges(*)")
            .order("created_at", { ascending: false });

        if (filterStatus) query = query.eq("status", filterStatus);
        if (filterStream) query = query.eq("stream", filterStream);

        const { data } = await query;
        if (data) setApplications(data as (Application & { profile?: Profile })[]);
        setLoading(false);
    }, [supabase, filterStatus, filterStream]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredApps.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredApps.map((a) => a.id));
        }
    };

    const handleBulkAction = async (newStatus: string) => {
        if (selectedIds.length === 0) {
            toast.error("Select at least one student");
            return;
        }

        const { error } = await supabase
            .from("applications")
            .update({ status: newStatus })
            .in("id", selectedIds);

        if (error) {
            toast.error("Update failed: " + error.message);
        } else {
            toast.success(`${selectedIds.length} student(s) updated to ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}`);
            setSelectedIds([]);
            fetchApplications();
        }
    };

    const filteredApps = applications.filter((app) => {
        if (!searchQuery) return true;
        const name = app.profile?.full_name?.toLowerCase() || "";
        const email = app.profile?.email?.toLowerCase() || "";
        return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    });

    // Stats
    const totalStudents = applications.length;
    const pendingReview = applications.filter((a) => a.status === "pending" || a.status === "under_review").length;
    const admitted = applications.filter((a) => a.status === "admitted").length;
    const totalRevenue = applications.reduce((sum, a) => sum + (a.paid_fees || 0), 0);

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "300px", marginBottom: "24px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "14px" }} />
                    ))}
                </div>
                <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                    🎯 Admin Command Center
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Manage student applications and track admissions
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                {[
                    { label: "Total Students", value: totalStudents, icon: "👥", color: "#3b82f6", bg: "#eff6ff" },
                    { label: "Pending Review", value: pendingReview, icon: "⏳", color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Admitted", value: admitted, icon: "🎓", color: "#10b981", bg: "#ecfdf5" },
                    { label: "Revenue Collected", value: formatCurrency(totalRevenue), icon: "💰", color: "#8b5cf6", bg: "#f5f3ff" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            background: "#ffffff",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <span style={{ width: "36px", height: "36px", borderRadius: "8px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{stat.icon}</span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</span>
                        </div>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Bulk Actions */}
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="🔍 Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: "9px 14px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "0.813rem",
                                outline: "none",
                                width: "220px",
                                background: "#f8fafc",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: "9px 14px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "0.813rem",
                                outline: "none",
                                background: "#f8fafc",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        {/* Stream Filter */}
                        <select
                            value={filterStream}
                            onChange={(e) => setFilterStream(e.target.value)}
                            style={{
                                padding: "9px 14px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "0.813rem",
                                outline: "none",
                                background: "#f8fafc",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">All Streams</option>
                            <option value="engineering">Engineering</option>
                            <option value="medical">Medical</option>
                            <option value="business">Business</option>
                            <option value="arts">Arts</option>
                            <option value="science">Science</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "0.813rem", color: "#64748b", fontWeight: 500 }}>
                                {selectedIds.length} selected
                            </span>
                            <button
                                onClick={() => handleBulkAction("verified")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#10b981",
                                    color: "#ffffff",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                ✓ Approve
                            </button>
                            <button
                                onClick={() => handleBulkAction("under_review")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #f59e0b",
                                    background: "#ffffff",
                                    color: "#f59e0b",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                🔄 Request Re-upload
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                <th style={{ padding: "12px 16px", textAlign: "left", width: "40px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: "pointer" }}
                                    />
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Student</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stream</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fees</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Applied</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
                                        <p style={{ fontWeight: 600 }}>No applications found</p>
                                        <p style={{ fontSize: "0.813rem" }}>Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => (
                                    <tr
                                        key={app.id}
                                        style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "#fafbfc")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "14px 16px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(app.id)}
                                                onChange={() => toggleSelect(app.id)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #c29d59, #d4b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0f172a", fontSize: "0.688rem" }}>
                                                    {app.profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem", margin: 0 }}>{app.profile?.full_name || "Unknown"}</p>
                                                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>{app.profile?.email || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#475569", textTransform: "capitalize" }}>
                                            {app.stream || "—"}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span className={`status-badge status-${app.status}`}>
                                                {STATUS_LABELS[app.status]}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{formatCurrency(app.paid_fees)}</p>
                                            <p style={{ fontSize: "0.688rem", color: "#94a3b8", margin: 0 }}>of {formatCurrency(app.total_fees)}</p>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.813rem", color: "#64748b" }}>
                                            {formatDate(app.created_at)}
                                        </td>
                                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                            <a
                                                href={`/admin/students/${app.id}`}
                                                style={{
                                                    padding: "6px 14px",
                                                    borderRadius: "6px",
                                                    border: "1px solid #e2e8f0",
                                                    background: "#ffffff",
                                                    color: "#64748b",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                    textDecoration: "none",
                                                    transition: "all 0.2s",
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = "#c29d59"; e.currentTarget.style.color = "#c29d59"; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                                            >
                                                View →
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
