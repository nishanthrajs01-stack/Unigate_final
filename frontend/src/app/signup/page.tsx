"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: "student",
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data.user) {
                toast.success("Account created successfully! Please check your email to verify.");
                router.push("/login");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.875rem",
        outline: "none",
        transition: "border-color 0.2s",
        background: "#f8fafc",
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div className="animate-fade-in" style={{ width: "100%", maxWidth: "440px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: 800,
                            color: "#ffffff",
                            letterSpacing: "3px",
                            margin: 0,
                            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        }}
                    >
                        UNIGATE
                    </h1>
                    <div style={{ width: "60px", height: "2px", background: "#c29d59", margin: "8px auto" }} />
                    <p style={{ color: "#c29d59", fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase" }}>
                        Consultancy
                    </p>
                </div>

                {/* Signup Card */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "40px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    }}
                >
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                        Create Account
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "32px" }}>
                        Start your journey with Unigate
                    </p>

                    <form onSubmit={handleSignup}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="Enter your full name"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Min 6 characters"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Re-enter password"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "13px",
                                background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.3s",
                                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
                            }}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.813rem", color: "#64748b" }}>
                        Already have an account?{" "}
                        <a href="/login" style={{ color: "#c29d59", textDecoration: "none", fontWeight: 600 }}>
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
