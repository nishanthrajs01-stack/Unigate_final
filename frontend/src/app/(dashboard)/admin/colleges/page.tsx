"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type College } from "@/lib/supabase";
import { toast } from "sonner";

export default function CollegesPage() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    const [form, setForm] = useState({
        name: "",
        location: "",
        country: "India",
        streams: [] as string[],
        description: "",
        website: "",
        contact_email: "",
        is_active: true,
    });

    const fetchColleges = useCallback(async () => {
        const { data } = await supabase
            .from("colleges")
            .select("*")
            .order("name");

        if (data) setColleges(data as College[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchColleges();
    }, [fetchColleges]);

    const openAddModal = () => {
        setEditingCollege(null);
        setForm({ name: "", location: "", country: "India", streams: [], description: "", website: "", contact_email: "", is_active: true });
        setShowModal(true);
    };

    const openEditModal = (college: College) => {
        setEditingCollege(college);
        setForm({
            name: college.name,
            location: college.location,
            country: college.country,
            streams: college.streams,
            description: college.description || "",
            website: college.website || "",
            contact_email: college.contact_email || "",
            is_active: college.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.location) {
            toast.error("Name and location are required");
            return;
        }

        if (editingCollege) {
            const { error } = await supabase
                .from("colleges")
                .update(form)
                .eq("id", editingCollege.id);

            if (error) toast.error("Update failed");
            else toast.success("College updated!");
        } else {
            const { error } = await supabase.from("colleges").insert(form);
            if (error) toast.error("Failed to add college");
            else toast.success("College added!");
        }

        setShowModal(false);
        fetchColleges();
    };

    const toggleActive = async (college: College) => {
        const { error } = await supabase
            .from("colleges")
            .update({ is_active: !college.is_active })
            .eq("id", college.id);

        if (error) toast.error("Failed to toggle status");
        else {
            toast.success(`${college.name} ${college.is_active ? "deactivated" : "activated"}`);
            fetchColleges();
        }
    };

    const filteredColleges = colleges.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const streamOptions = ["Engineering", "Medical", "Business", "Arts", "Science", "Law"];

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.875rem",
        outline: "none",
        background: "#f8fafc",
        color: "#0f172a",
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "260px", marginBottom: "24px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "14px" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                        🏫 College Management
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        Manage partner institutions and programs
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    style={{
                        padding: "10px 22px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #0f172a, #1e293b)",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
                    }}
                >
                    + Add College
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="🔍 Search colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, marginBottom: "24px", maxWidth: "360px" }}
                onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />

            {/* College Grid */}
            {filteredColleges.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏫</div>
                    <h3 style={{ color: "#64748b", fontWeight: 600 }}>No colleges found</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Add your first partner institution</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {filteredColleges.map((college) => (
                        <div
                            key={college.id}
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "24px",
                                border: "1px solid #e2e8f0",
                                transition: "all 0.2s",
                                opacity: college.is_active ? 1 : 0.6,
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                                    🏛️
                                </div>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "0.688rem",
                                    fontWeight: 600,
                                    background: college.is_active ? "#d1fae5" : "#fee2e2",
                                    color: college.is_active ? "#065f46" : "#b91c1c",
                                }}>
                                    {college.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{college.name}</h3>
                            <p style={{ color: "#64748b", fontSize: "0.813rem", marginBottom: "12px" }}>📍 {college.location}, {college.country}</p>
                            {college.streams.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                                    {college.streams.map((s) => (
                                        <span key={s} style={{ padding: "3px 10px", borderRadius: "12px", background: "#f1f5f9", color: "#64748b", fontSize: "0.688rem", fontWeight: 500 }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => openEditModal(college)}
                                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => toggleActive(college)}
                                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: college.is_active ? "#ef4444" : "#10b981", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}
                                >
                                    {college.is_active ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "20px",
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="animate-fade-in" style={{ background: "#ffffff", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "560px", maxHeight: "85vh", overflow: "auto" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>
                            {editingCollege ? "Edit College" : "Add New College"}
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Name *</label>
                                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="College name" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Location *</label>
                                <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Country</label>
                                <input style={inputStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Website</label>
                                <input style={inputStyle} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Contact Email</label>
                                <input style={inputStyle} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="contact@college.edu" />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Streams</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {streamOptions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setForm({ ...form, streams: form.streams.includes(s) ? form.streams.filter((x) => x !== s) : [...form.streams, s] })}
                                            style={{
                                                padding: "6px 14px",
                                                borderRadius: "16px",
                                                border: form.streams.includes(s) ? "2px solid #c29d59" : "1px solid #e2e8f0",
                                                background: form.streams.includes(s) ? "#fef8ee" : "#ffffff",
                                                color: form.streams.includes(s) ? "#c29d59" : "#64748b",
                                                fontSize: "0.75rem",
                                                fontWeight: form.streams.includes(s) ? 600 : 400,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Description</label>
                                <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "28px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", fontSize: "0.875rem", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "#ffffff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
                            >
                                {editingCollege ? "Save Changes" : "Add College"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
