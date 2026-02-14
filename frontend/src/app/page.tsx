"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace("/login");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "2px",
            marginBottom: "8px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          UNIGATE
        </h1>
        <p
          style={{
            color: "#c29d59",
            fontSize: "0.875rem",
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          Consultancy
        </p>
        <div
          style={{
            marginTop: "32px",
            width: "40px",
            height: "40px",
            border: "3px solid #c29d5940",
            borderTop: "3px solid #c29d59",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "32px auto 0",
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
