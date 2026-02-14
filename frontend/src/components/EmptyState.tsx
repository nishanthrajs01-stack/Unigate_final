import React from "react";

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = "📭",
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div
            className="animate-fade-in"
            style={{
                textAlign: "center",
                padding: "60px 24px",
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
            }}
        >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{icon}</div>
            <h3
                style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "8px",
                }}
            >
                {title}
            </h3>
            {description && (
                <p
                    style={{
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        maxWidth: "360px",
                        margin: "0 auto",
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </p>
            )}
            {(actionLabel && actionHref) && (
                <a
                    href={actionHref}
                    style={{
                        display: "inline-block",
                        marginTop: "24px",
                        padding: "10px 24px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #0f172a, #1e293b)",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
                        transition: "transform 0.2s",
                    }}
                >
                    {actionLabel}
                </a>
            )}
            {(actionLabel && onAction && !actionHref) && (
                <button
                    onClick={onAction}
                    style={{
                        marginTop: "24px",
                        padding: "10px 24px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #0f172a, #1e293b)",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
                        transition: "transform 0.2s",
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
