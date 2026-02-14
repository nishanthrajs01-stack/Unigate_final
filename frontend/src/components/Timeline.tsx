"use client";

import React from "react";

interface TimelineStep {
    label: string;
    description?: string;
    icon?: string;
}

interface TimelineProps {
    steps: TimelineStep[];
    currentStep: number;
    orientation?: "horizontal" | "vertical";
}

export default function Timeline({ steps, currentStep, orientation = "horizontal" }: TimelineProps) {
    if (orientation === "vertical") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {steps.map((step, i) => {
                    const isDone = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isFuture = i > currentStep;

                    return (
                        <div key={step.label} style={{ display: "flex", gap: "16px" }}>
                            {/* Line + Dot */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "32px" }}>
                                <div
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: isDone
                                            ? "linear-gradient(135deg, #10b981, #34d399)"
                                            : isCurrent
                                                ? "linear-gradient(135deg, #c29d59, #d4b87a)"
                                                : "#e2e8f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        color: isDone || isCurrent ? "#ffffff" : "#94a3b8",
                                        transition: "all 0.3s",
                                        boxShadow: isCurrent ? "0 0 0 4px rgba(194,157,89,0.2)" : "none",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isDone ? "✓" : step.icon || i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        style={{
                                            width: "2px",
                                            height: "40px",
                                            background: isDone ? "#10b981" : "#e2e8f0",
                                            transition: "background 0.3s",
                                        }}
                                    />
                                )}
                            </div>
                            {/* Label */}
                            <div style={{ paddingBottom: i < steps.length - 1 ? "24px" : "0", paddingTop: "2px" }}>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: isDone || isCurrent ? 600 : 400,
                                        color: isFuture ? "#94a3b8" : "#0f172a",
                                        margin: 0,
                                    }}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "4px 0 0" }}>{step.description}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0", width: "100%" }}>
            {steps.map((step, i) => {
                const isDone = i < currentStep;
                const isCurrent = i === currentStep;
                const isFuture = i > currentStep;

                return (
                    <div key={step.label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                        {/* Dot + Label */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px" }}>
                            <div
                                className={isCurrent ? "timeline-pulse" : ""}
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: isDone
                                        ? "linear-gradient(135deg, #10b981, #34d399)"
                                        : isCurrent
                                            ? "linear-gradient(135deg, #c29d59, #d4b87a)"
                                            : "#e2e8f0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: isDone || isCurrent ? "#ffffff" : "#94a3b8",
                                    transition: "all 0.3s",
                                    boxShadow: isCurrent ? "0 0 0 4px rgba(194,157,89,0.2)" : "none",
                                }}
                            >
                                {isDone ? "✓" : step.icon || i + 1}
                            </div>
                            <p
                                style={{
                                    fontSize: "0.688rem",
                                    fontWeight: isDone || isCurrent ? 600 : 400,
                                    color: isFuture ? "#94a3b8" : "#0f172a",
                                    margin: "8px 0 0",
                                    textAlign: "center",
                                    lineHeight: 1.3,
                                    maxWidth: "80px",
                                }}
                            >
                                {step.label}
                            </p>
                        </div>
                        {/* Connector Line */}
                        {i < steps.length - 1 && (
                            <div
                                style={{
                                    flex: 1,
                                    height: "2px",
                                    background: isDone ? "#10b981" : "#e2e8f0",
                                    transition: "background 0.3s",
                                    marginBottom: "28px",
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
