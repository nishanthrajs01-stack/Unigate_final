"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type Application, type College } from "@/lib/supabase";
import { toast } from "sonner";

const STEPS = ["Personal Info", "Academic Info", "Program Selection", "Review & Submit"];

export default function ApplicationPage() {
    const [step, setStep] = useState(0);
    const [application, setApplication] = useState<Application | null>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Form data
    const [personalInfo, setPersonalInfo] = useState({
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        nationality: "",
        passport_number: "",
        address: "",
        city: "",
        country: "",
    });

    const [academicInfo, setAcademicInfo] = useState({
        highest_qualification: "",
        institution_name: "",
        graduation_year: "",
        percentage: "",
        english_proficiency: "",
        english_score: "",
    });

    const [programInfo, setProgramInfo] = useState({
        stream: "",
        program: "",
        intake_year: new Date().getFullYear() + 1,
        college_id: "",
    });

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch existing application
        const { data: appData } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (appData) {
            setApplication(appData as Application);
            if (appData.personal_info && typeof appData.personal_info === 'object') {
                setPersonalInfo(prev => ({ ...prev, ...(appData.personal_info as Record<string, string>) }));
            }
            if (appData.academic_info && typeof appData.academic_info === 'object') {
                setAcademicInfo(prev => ({ ...prev, ...(appData.academic_info as Record<string, string>) }));
            }
            setProgramInfo(prev => ({
                ...prev,
                stream: appData.stream || "",
                program: appData.program || "",
                intake_year: appData.intake_year || prev.intake_year,
                college_id: appData.college_id || "",
            }));
        }

        // Fetch colleges
        const { data: collegeData } = await supabase
            .from("colleges")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (collegeData) setColleges(collegeData as College[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveDraft = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            status: "draft" as const,
            personal_info: personalInfo,
            academic_info: academicInfo,
            stream: programInfo.stream,
            program: programInfo.program,
            intake_year: programInfo.intake_year,
            college_id: programInfo.college_id || null,
        };

        if (application) {
            await supabase.from("applications").update(payload).eq("id", application.id);
        } else {
            const { data } = await supabase.from("applications").insert(payload).select().single();
            if (data) setApplication(data as Application);
        }

        toast.success("Draft saved!");
        setSaving(false);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            status: "pending" as const,
            personal_info: personalInfo,
            academic_info: academicInfo,
            stream: programInfo.stream,
            program: programInfo.program,
            intake_year: programInfo.intake_year,
            college_id: programInfo.college_id || null,
        };

        if (application) {
            await supabase.from("applications").update(payload).eq("id", application.id);
        } else {
            await supabase.from("applications").insert(payload);
        }

        toast.success("Application submitted for review!");
        setSaving(false);
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.875rem",
        outline: "none",
        transition: "border-color 0.2s",
        background: "#f8fafc",
        color: "#0f172a",
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
                <div className="skeleton" style={{ height: "32px", width: "250px", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "400px", borderRadius: "16px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                    📝 Application Form
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Complete all steps to submit your application
                </p>
            </div>

            {/* Step Progress */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
                {STEPS.map((s, i) => (
                    <button
                        key={s}
                        onClick={() => setStep(i)}
                        style={{
                            flex: 1,
                            padding: "12px 8px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: step === i ? 700 : 500,
                            background: step === i ? "linear-gradient(135deg, #0f172a, #1e293b)" : i < step ? "#d1fae5" : "#f1f5f9",
                            color: step === i ? "#ffffff" : i < step ? "#065f46" : "#64748b",
                            transition: "all 0.2s",
                        }}
                    >
                        {i < step ? "✓ " : ""}{s}
                    </button>
                ))}
            </div>

            {/* Form Card */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>

                {/* Step 1: Personal Info */}
                {step === 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Father&apos;s Name</label>
                            <input style={inputStyle} value={personalInfo.father_name} onChange={(e) => setPersonalInfo({ ...personalInfo, father_name: e.target.value })} placeholder="Enter father's name" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Mother&apos;s Name</label>
                            <input style={inputStyle} value={personalInfo.mother_name} onChange={(e) => setPersonalInfo({ ...personalInfo, mother_name: e.target.value })} placeholder="Enter mother's name" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Date of Birth</label>
                            <input type="date" style={inputStyle} value={personalInfo.date_of_birth} onChange={(e) => setPersonalInfo({ ...personalInfo, date_of_birth: e.target.value })} onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Nationality</label>
                            <input style={inputStyle} value={personalInfo.nationality} onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })} placeholder="e.g. Indian" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Passport Number</label>
                            <input style={inputStyle} value={personalInfo.passport_number} onChange={(e) => setPersonalInfo({ ...personalInfo, passport_number: e.target.value })} placeholder="Enter passport number" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input style={inputStyle} value={personalInfo.city} onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })} placeholder="Enter city" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Address</label>
                            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={personalInfo.address} onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })} placeholder="Full address" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                    </div>
                )}

                {/* Step 2: Academic Info */}
                {step === 1 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Highest Qualification</label>
                            <select style={inputStyle} value={academicInfo.highest_qualification} onChange={(e) => setAcademicInfo({ ...academicInfo, highest_qualification: e.target.value })}>
                                <option value="">Select...</option>
                                <option value="10th">10th Standard</option>
                                <option value="12th">12th Standard</option>
                                <option value="bachelors">Bachelor&apos;s Degree</option>
                                <option value="masters">Master&apos;s Degree</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Institution Name</label>
                            <input style={inputStyle} value={academicInfo.institution_name} onChange={(e) => setAcademicInfo({ ...academicInfo, institution_name: e.target.value })} placeholder="University/School name" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Graduation Year</label>
                            <input type="number" style={inputStyle} value={academicInfo.graduation_year} onChange={(e) => setAcademicInfo({ ...academicInfo, graduation_year: e.target.value })} placeholder="e.g. 2024" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Percentage / CGPA</label>
                            <input style={inputStyle} value={academicInfo.percentage} onChange={(e) => setAcademicInfo({ ...academicInfo, percentage: e.target.value })} placeholder="e.g. 85% or 8.5 CGPA" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>English Proficiency Test</label>
                            <select style={inputStyle} value={academicInfo.english_proficiency} onChange={(e) => setAcademicInfo({ ...academicInfo, english_proficiency: e.target.value })}>
                                <option value="">Select...</option>
                                <option value="ielts">IELTS</option>
                                <option value="toefl">TOEFL</option>
                                <option value="pte">PTE</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Score</label>
                            <input style={inputStyle} value={academicInfo.english_score} onChange={(e) => setAcademicInfo({ ...academicInfo, english_score: e.target.value })} placeholder="e.g. 7.0" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                    </div>
                )}

                {/* Step 3: Program Selection */}
                {step === 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Stream</label>
                            <select style={inputStyle} value={programInfo.stream} onChange={(e) => setProgramInfo({ ...programInfo, stream: e.target.value })}>
                                <option value="">Select Stream...</option>
                                <option value="engineering">Engineering</option>
                                <option value="medical">Medical</option>
                                <option value="business">Business</option>
                                <option value="arts">Arts & Humanities</option>
                                <option value="science">Science</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Program</label>
                            <input style={inputStyle} value={programInfo.program} onChange={(e) => setProgramInfo({ ...programInfo, program: e.target.value })} placeholder="e.g. MBBS, B.Tech CS" onFocus={(e) => e.target.style.borderColor = "#c29d59"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </div>
                        <div>
                            <label style={labelStyle}>Intake Year</label>
                            <select style={inputStyle} value={programInfo.intake_year} onChange={(e) => setProgramInfo({ ...programInfo, intake_year: parseInt(e.target.value) })}>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Preferred College</label>
                            <select style={inputStyle} value={programInfo.college_id} onChange={(e) => setProgramInfo({ ...programInfo, college_id: e.target.value })}>
                                <option value="">Select College (Optional)...</option>
                                {colleges.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 3 && (
                    <div>
                        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Personal Information</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {Object.entries(personalInfo).filter(([, v]) => v).map(([key, value]) => (
                                    <div key={key}>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</p>
                                        <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Academic Information</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {Object.entries(academicInfo).filter(([, v]) => v).map(([key, value]) => (
                                    <div key={key}>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</p>
                                        <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Program Selection</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Stream</p>
                                    <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>{programInfo.stream || "—"}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Program</p>
                                    <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{programInfo.program || "—"}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Intake Year</p>
                                    <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>{programInfo.intake_year}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
                    <button
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        style={{
                            padding: "11px 24px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            cursor: step === 0 ? "not-allowed" : "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: step === 0 ? "#cbd5e1" : "#64748b",
                            transition: "all 0.2s",
                        }}
                    >
                        ← Back
                    </button>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={handleSaveDraft}
                            disabled={saving}
                            style={{
                                padding: "11px 24px",
                                borderRadius: "10px",
                                border: "1px solid #c29d59",
                                background: "#ffffff",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "#c29d59",
                                transition: "all 0.2s",
                            }}
                        >
                            {saving ? "Saving..." : "Save Draft"}
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                style={{
                                    padding: "11px 24px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#ffffff",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
                                }}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{
                                    padding: "11px 28px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#ffffff",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
                                }}
                            >
                                {saving ? "Submitting..." : "Submit Application ✓"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
