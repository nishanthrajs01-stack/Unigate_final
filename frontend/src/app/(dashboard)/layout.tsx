"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, type Profile } from "@/lib/supabase";
import { getInitials } from "@/lib/utils";

const studentNav = [
    { label: "Dashboard", href: "/student", icon: "📊" },
    { label: "Application", href: "/student/application", icon: "📝" },
    { label: "Documents", href: "/student/documents", icon: "📁" },
    { label: "Notifications", href: "/notifications", icon: "🔔" },
    { label: "Profile", href: "/profile", icon: "⚙️" },
];

const adminNav = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Students", href: "/admin", icon: "👥" },
    { label: "Colleges", href: "/admin/colleges", icon: "🏫" },
    { label: "Finance", href: "/admin/finance", icon: "💰" },
    { label: "Notifications", href: "/notifications", icon: "🔔" },
    { label: "Profile", href: "/profile", icon: "⚙️" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const fetchProfile = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            router.push("/login");
            return;
        }

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (data) {
            setProfile(data as Profile);
        }

        // Get unread notifications
        const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        setNotificationCount(count || 0);
    }, [supabase, router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems =
        profile?.role === "admin" || profile?.role === "counselor"
            ? adminNav
            : studentNav;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
            {/* Sidebar — Desktop */}
            <aside
                style={{
                    width: sidebarOpen ? "280px" : "72px",
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                    transition: "width 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 40,
                    overflow: "hidden",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        padding: sidebarOpen ? "24px 24px 20px" : "24px 16px 20px",
                        borderBottom: "1px solid #ffffff10",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #c29d59, #d4b87a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                color: "#0f172a",
                                fontSize: "1.1rem",
                                flexShrink: 0,
                            }}
                        >
                            U
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h2
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        letterSpacing: "1px",
                                        margin: 0,
                                    }}
                                >
                                    UNIGATE
                                </h2>
                                <p
                                    style={{
                                        color: "#c29d59",
                                        fontSize: "0.65rem",
                                        letterSpacing: "2px",
                                        margin: 0,
                                    }}
                                >
                                    CONSULTANCY
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                    {sidebarOpen && (
                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                padding: "0 12px",
                                marginBottom: "12px",
                            }}
                        >
                            Navigation
                        </p>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: sidebarOpen ? "11px 16px" : "11px",
                                    justifyContent: sidebarOpen ? "flex-start" : "center",
                                    borderRadius: "10px",
                                    marginBottom: "4px",
                                    textDecoration: "none",
                                    fontSize: "0.875rem",
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "#ffffff" : "#94a3b8",
                                    background: isActive
                                        ? "linear-gradient(135deg, #c29d5930, #c29d5915)"
                                        : "transparent",
                                    borderLeft: isActive ? "3px solid #c29d59" : "3px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {/* User section */}
                {profile && (
                    <div
                        style={{
                            padding: "16px",
                            borderTop: "1px solid #ffffff10",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #c29d59, #d4b87a)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    fontSize: "0.75rem",
                                    flexShrink: 0,
                                }}
                            >
                                {getInitials(profile.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "0.813rem",
                                            fontWeight: 600,
                                            margin: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {profile.full_name}
                                    </p>
                                    <p
                                        style={{
                                            color: "#64748b",
                                            fontSize: "0.688rem",
                                            textTransform: "capitalize",
                                            margin: 0,
                                        }}
                                    >
                                        {profile.role}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    marginLeft: sidebarOpen ? "280px" : "72px",
                    transition: "margin-left 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Top Bar */}
                <header
                    style={{
                        height: "64px",
                        background: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "8px",
                                borderRadius: "8px",
                                color: "#64748b",
                                fontSize: "1.2rem",
                                display: "flex",
                                alignItems: "center",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                            ☰
                        </button>
                        {/* Mobile menu */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                display: "none",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "8px",
                                color: "#64748b",
                                fontSize: "1.2rem",
                            }}
                        >
                            📱
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {/* Notifications */}
                        <a
                            href="/notifications"
                            style={{
                                position: "relative",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "8px",
                                borderRadius: "8px",
                                fontSize: "1.2rem",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                            🔔
                            {notificationCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        width: "18px",
                                        height: "18px",
                                        borderRadius: "50%",
                                        background: "#ef4444",
                                        color: "#ffffff",
                                        fontSize: "0.625rem",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {notificationCount}
                                </span>
                            )}
                        </a>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                                cursor: "pointer",
                                fontSize: "0.813rem",
                                fontWeight: 500,
                                color: "#64748b",
                                transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = "#ef4444";
                                e.currentTarget.style.color = "#ef4444";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = "#e2e8f0";
                                e.currentTarget.style.color = "#64748b";
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: "28px" }}>{children}</main>
            </div>
        </div>
    );
}
