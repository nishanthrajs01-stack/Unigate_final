"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"password" | "magic">("password");
    const [magicSent, setMagicSent] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data.user) {
                toast.success("Welcome back!");
                // Fetch user role to redirect
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();

                if (profile?.role === "admin" || profile?.role === "counselor") {
                    router.push("/admin");
                } else {
                    router.push("/student");
                }
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/student` },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            setMagicSent(true);
            toast.success("Magic link sent! Check your email.");
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/student` },
        });

        if (error) {
            toast.error(error.message);
        }
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
            {/* Decorative background elements */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "5%",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, #c29d5910 0%, transparent 70%)",
                    borderRadius: "50%",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "10%",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, #c29d5908 0%, transparent 70%)",
                    borderRadius: "50%",
                }}
            />

            <div
                className="animate-fade-in"
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
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
                    <div
                        style={{
                            width: "60px",
                            height: "2px",
                            background: "#c29d59",
                            margin: "8px auto",
                        }}
                    />
                    <p
                        style={{
                            color: "#c29d59",
                            fontSize: "0.75rem",
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                        }}
                    >
                        Consultancy
                    </p>
                </div>

                {/* Login Card */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "40px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        Welcome Back
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "32px" }}>
                        Sign in to your account to continue
                    </p>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#334155",
                            transition: "all 0.2s",
                            marginBottom: "24px",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                            e.currentTarget.style.borderColor = "#c29d59";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "24px",
                        }}
                    >
                        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                            or
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                    </div>

                    {/* Mode Toggle */}
                    <div
                        style={{
                            display: "flex",
                            background: "#f1f5f9",
                            borderRadius: "10px",
                            padding: "4px",
                            marginBottom: "24px",
                        }}
                    >
                        <button
                            onClick={() => { setMode("password"); setMagicSent(false); }}
                            style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.813rem",
                                fontWeight: mode === "password" ? 600 : 400,
                                background: mode === "password" ? "#ffffff" : "transparent",
                                color: mode === "password" ? "#0f172a" : "#64748b",
                                boxShadow: mode === "password" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            Password
                        </button>
                        <button
                            onClick={() => { setMode("magic"); setMagicSent(false); }}
                            style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.813rem",
                                fontWeight: mode === "magic" ? 600 : 400,
                                background: mode === "magic" ? "#ffffff" : "transparent",
                                color: mode === "magic" ? "#0f172a" : "#64748b",
                                boxShadow: mode === "magic" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            Magic Link ✨
                        </button>
                    </div>

                    {magicSent ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "32px 20px",
                                background: "#f0fdf4",
                                borderRadius: "12px",
                                border: "1px solid #bbf7d0",
                            }}
                        >
                            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📧</div>
                            <h3 style={{ color: "#065f46", marginBottom: "8px", fontWeight: 600 }}>
                                Check your email
                            </h3>
                            <p style={{ color: "#047857", fontSize: "0.875rem" }}>
                                We sent a magic link to <strong>{email}</strong>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={mode === "password" ? handleEmailLogin : handleMagicLink}>
                            {/* Email */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.813rem",
                                        fontWeight: 500,
                                        color: "#374151",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    style={{
                                        width: "100%",
                                        padding: "12px 14px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "10px",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                        background: "#f8fafc",
                                        color: "#0f172a",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>

                            {/* Password (only for password mode) */}
                            {mode === "password" && (
                                <div style={{ marginBottom: "24px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.813rem",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter your password"
                                        style={{
                                            width: "100%",
                                            padding: "12px 14px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "10px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                            transition: "border-color 0.2s",
                                            background: "#f8fafc",
                                            color: "#0f172a",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#c29d59")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "13px",
                                    background: loading
                                        ? "#94a3b8"
                                        : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s",
                                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                {loading
                                    ? "Please wait..."
                                    : mode === "password"
                                        ? "Sign In"
                                        : "Send Magic Link"}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <p
                        style={{
                            textAlign: "center",
                            marginTop: "24px",
                            fontSize: "0.813rem",
                            color: "#64748b",
                        }}
                    >
                        Don&apos;t have an account?{" "}
                        <a
                            href="/signup"
                            style={{
                                color: "#c29d59",
                                textDecoration: "none",
                                fontWeight: 600,
                            }}
                        >
                            Sign Up
                        </a>
                    </p>
                </div>

                {/* Bottom text */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "24px",
                        fontSize: "0.75rem",
                        color: "#64748b",
                    }}
                >
                    © 2024 Unigate Consultancy. All rights reserved.
                </p>
            </div>
        </div>
    );
}
