"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Notification as NotifType } from "@/lib/supabase";

const TYPE_ICONS: Record<string, string> = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    status_change: "🔄",
    document: "📄",
    payment: "💰",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotifType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const supabase = createClient();

    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100);

        if (filter === "unread") query = query.eq("is_read", false);

        const { data } = await query;
        if (data) setNotifications(data as NotifType[]);
        setLoading(false);
    }, [supabase, filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return then.toLocaleDateString();
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "250px", marginBottom: "24px" }} />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "12px", marginBottom: "10px" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                        🔔 Notifications
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up!"}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    {/* Filter */}
                    <div style={{ display: "flex", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        {(["all", "unread"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: "8px 18px",
                                    border: "none",
                                    background: filter === f ? "#0f172a" : "#ffffff",
                                    color: filter === f ? "#ffffff" : "#64748b",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    textTransform: "capitalize",
                                    transition: "all 0.2s",
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                                color: "#64748b",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            Mark all read ✓
                        </button>
                    )}
                </div>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔕</div>
                        <h3 style={{ color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            You&apos;ll be notified about important updates here
                        </p>
                    </div>
                ) : (
                    notifications.map((notif, i) => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "16px",
                                padding: "18px 24px",
                                borderBottom: i < notifications.length - 1 ? "1px solid #f1f5f9" : "none",
                                background: notif.is_read ? "#ffffff" : "#fafbff",
                                cursor: notif.is_read ? "default" : "pointer",
                                transition: "background 0.2s",
                            }}
                            onMouseOver={(e) => {
                                if (!notif.is_read) e.currentTarget.style.background = "#f8fafc";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = notif.is_read ? "#ffffff" : "#fafbff";
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    background: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.1rem",
                                    flexShrink: 0,
                                }}
                            >
                                {TYPE_ICONS[notif.type] || "📬"}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <p style={{ fontWeight: notif.is_read ? 500 : 700, color: "#0f172a", fontSize: "0.875rem", margin: 0 }}>
                                        {notif.title}
                                    </p>
                                    {!notif.is_read && (
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                                    )}
                                </div>
                                <p style={{ color: "#64748b", fontSize: "0.813rem", margin: 0, lineHeight: 1.5 }}>
                                    {notif.message}
                                </p>
                            </div>

                            {/* Time */}
                            <span style={{ fontSize: "0.688rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, marginTop: "2px" }}>
                                {formatTimeAgo(notif.created_at)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
