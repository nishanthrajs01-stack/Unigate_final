"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Document as DocType } from "@/lib/supabase";
import { generateDocumentName, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const DOC_TYPES = [
    "Passport",
    "10th Marksheet",
    "12th Marksheet",
    "Degree Certificate",
    "IELTS/TOEFL Score",
    "Statement of Purpose",
    "Recommendation Letter",
    "Resume/CV",
    "Photograph",
    "Other",
];

const STATUS_ICONS: Record<string, string> = {
    pending: "⏳",
    approved: "✅",
    rejected: "❌",
    reupload_required: "🔄",
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocType[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const supabase = createClient();

    const fetchDocuments = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setDocuments(data as DocType[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = async (file: File) => {
        if (!selectedType) {
            toast.error("Please select a document type first");
            return;
        }

        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile for auto-naming
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

        const autoName = generateDocumentName(
            profile?.full_name || "Student",
            selectedType.replace(/\s+/g, "_")
        );
        const ext = file.name.split(".").pop();
        const storagePath = `documents/${user.id}/${autoName}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("student-documents")
            .upload(storagePath, file, { upsert: true });

        if (uploadError) {
            toast.error("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        // Get the application
        const { data: app } = await supabase
            .from("applications")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (!app) {
            toast.error("Please create an application first");
            setUploading(false);
            return;
        }

        // Create document record
        const { error: insertError } = await supabase.from("documents").insert({
            application_id: app.id,
            user_id: user.id,
            doc_type: selectedType,
            original_name: file.name,
            storage_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
            status: "pending",
        });

        if (insertError) {
            toast.error("Error saving document record");
        } else {
            toast.success(`${selectedType} uploaded successfully!`);
            setSelectedType("");
            fetchDocuments();
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "250px", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "200px", borderRadius: "16px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                    📁 Document Vault
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Upload and manage your academic documents securely
                </p>
            </div>

            {/* Upload Section */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
                    Upload Document
                </h2>

                {/* Document Type */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.813rem", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                        Document Type *
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {DOC_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "20px",
                                    border: selectedType === type ? "2px solid #c29d59" : "1px solid #e2e8f0",
                                    background: selectedType === type ? "#fef8ee" : "#ffffff",
                                    cursor: "pointer",
                                    fontSize: "0.813rem",
                                    fontWeight: selectedType === type ? 600 : 400,
                                    color: selectedType === type ? "#c29d59" : "#64748b",
                                    transition: "all 0.2s",
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dragActive ? "#c29d59" : "#e2e8f0"}`,
                        borderRadius: "14px",
                        padding: "40px",
                        textAlign: "center",
                        background: dragActive ? "#fef8ee" : "#f8fafc",
                        transition: "all 0.2s",
                        cursor: "pointer",
                    }}
                    onClick={() => document.getElementById("file-input")?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                        {uploading ? "⏳" : "📤"}
                    </div>
                    <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.938rem" }}>
                        {uploading ? "Uploading..." : "Drop your file here or click to browse"}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "8px" }}>
                        PDF, JPG, PNG, DOC up to 10MB • Files are auto-renamed for consistency
                    </p>
                </div>
            </div>

            {/* Documents List */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
                    Uploaded Documents ({documents.length})
                </h2>

                {documents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 20px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📂</div>
                        <h3 style={{ color: "#64748b", fontWeight: 600, marginBottom: "8px" }}>No documents yet</h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            Upload your first document above to get started
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    borderRadius: "12px",
                                    border: "1px solid #f1f5f9",
                                    background: "#fafbfc",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = "#f1f5f9";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            borderRadius: "10px",
                                            background: "#eff6ff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.1rem",
                                        }}
                                    >
                                        📄
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>
                                            {doc.doc_type}
                                        </p>
                                        <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                                            {doc.original_name} • {formatDate(doc.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`status-badge status-${doc.status}`}>
                                    {STATUS_ICONS[doc.status]} {doc.status.replace(/_/g, " ")}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
