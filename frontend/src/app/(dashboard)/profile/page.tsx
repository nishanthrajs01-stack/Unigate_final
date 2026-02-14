"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Profile } from "@/lib/supabase";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        avatar_url: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const fetchProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (data) {
            const p = data as Profile;
            setProfile(p);
            setForm({
                full_name: p.full_name || "",
                phone: p.phone || "",
                avatar_url: p.avatar_url || "",
            });
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: form.full_name,
                phone: form.phone,
                avatar_url: form.avatar_url,
            })
            .eq("id", profile.id);

        if (error) {
            toast.error("Failed to update profile");
        } else {
            toast.success("Profile updated!");
            fetchProfile();
        }
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: passwordForm.newPassword,
        });

        if (error) {
            toast.error("Password update failed: " + error.message);
        } else {
            toast.success("Password changed successfully!");
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.875rem",
        outline: "none",
        background: "#f8fafc",
        color: "#0f172a",
        transition: "border-color 0.2s",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.813rem",
        fontWeight: 500,
        color: "#374151",
        marginBottom: "6px",
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "220px", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                    ⚙️ Profile Settings
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Manage your account information and preferences
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Profile Card */}
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
                        <div
                            style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #c29d59, #d4b87a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "#0f172a",
                                boxShadow: "0 4px 12px rgba(194,157,89,0.3)",
                            }}
                        >
                            {getInitials(profile?.full_name || "U")}
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                                {profile?.full_name || "User"}
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>{profile?.email}</p>
                            <span style={{
                                display: "inline-block",
                                marginTop: "8px",
                                padding: "3px 12px",
                                borderRadius: "12px",
                                background: "#eff6ff",
                                color: "#3b82f6",
                                fontSize: "0.688rem",
                                fontWeight: 600,
                                textTransform: "capitalize",
                            }}>
                                {profile?.role || "student"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                style={inputStyle}
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Your full name"
                                onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input
                                style={inputStyle}
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Avatar URL</label>
                            <input
                                style={inputStyle}
                                value={form.avatar_url}
                                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                                placeholder="https://example.com/avatar.jpg"
                                onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            style={{
                                padding: "11px 24px",
                                borderRadius: "10px",
                                border: "none",
                                background: "linear-gradient(135deg, #0f172a, #1e293b)",
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
                                alignSelf: "flex-start",
                            }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Security Card */}
                <div>
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>
                            🔒 Change Password
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Min 6 characters"
                                    onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Re-enter new password"
                                    onFocus={(e) => e.target.style.borderColor = "#c29d59"}
                                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                style={{
                                    padding: "11px 24px",
                                    borderRadius: "10px",
                                    border: "1px solid #c29d59",
                                    background: "#ffffff",
                                    color: "#c29d59",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    alignSelf: "flex-start",
                                }}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                            📋 Account Info
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.813rem" }}>Email</span>
                                <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.813rem" }}>{profile?.email}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.813rem" }}>Role</span>
                                <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.813rem", textTransform: "capitalize" }}>{profile?.role}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.813rem" }}>User ID</span>
                                <span style={{ color: "#94a3b8", fontSize: "0.688rem", fontFamily: "monospace" }}>{profile?.id?.slice(0, 12)}...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
