-- ============================================================
-- UCMS — Unigate Consultancy Management System
-- Supabase PostgreSQL Schema + RLS Policies
-- ============================================================
-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('student', 'counselor', 'admin');
CREATE TYPE application_status AS ENUM (
    'draft',
    'pending',
    'under_review',
    'verified',
    'college_allocated',
    'admitted',
    'rejected'
);
CREATE TYPE document_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'reupload_required'
);
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    nationality TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 3. Colleges Table
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    streams TEXT [] DEFAULT '{}',
    description TEXT,
    logo_url TEXT,
    website TEXT,
    contact_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 4. Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id) ON DELETE
    SET NULL,
        counselor_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        status application_status NOT NULL DEFAULT 'draft',
        stream TEXT,
        program TEXT,
        intake_year INT,
        total_fees NUMERIC(12, 2) DEFAULT 0,
        paid_fees NUMERIC(12, 2) DEFAULT 0,
        notes TEXT,
        personal_info JSONB DEFAULT '{}',
        academic_info JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 5. Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    status document_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 6. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 7. Fee Payments Table
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL DEFAULT 'bank_transfer',
    reference_number TEXT,
    receipt_url TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 8. Offer Letters Table (for QR verification)
CREATE TABLE offer_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    program TEXT,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdf_url TEXT,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    generated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_counselor_id ON applications(counselor_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_fee_payments_application_id ON fee_payments(application_id);
-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
SELECT role
FROM profiles
WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON profiles FOR
SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Counselors can view assigned" ON profiles FOR
SELECT USING (
        get_user_role() = 'counselor'
        AND id IN (
            SELECT user_id
            FROM applications
            WHERE counselor_id = auth.uid()
        )
    );
-- COLLEGES (public read, admin write)
CREATE POLICY "Anyone can view active colleges" ON colleges FOR
SELECT USING (is_active = true);
CREATE POLICY "Admins can manage colleges" ON colleges FOR ALL USING (get_user_role() = 'admin');
-- APPLICATIONS
CREATE POLICY "Students see own applications" ON applications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Students can create applications" ON applications FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students can update own drafts" ON applications FOR
UPDATE USING (
        user_id = auth.uid()
        AND status = 'draft'
    );
CREATE POLICY "Admins can manage applications" ON applications FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Counselors see assigned apps" ON applications FOR
SELECT USING (counselor_id = auth.uid());
CREATE POLICY "Counselors can update assigned" ON applications FOR
UPDATE USING (counselor_id = auth.uid());
-- DOCUMENTS
CREATE POLICY "Students see own documents" ON documents FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Students can upload documents" ON documents FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage documents" ON documents FOR ALL USING (get_user_role() = 'admin');
-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can mark own as read" ON notifications FOR
UPDATE USING (user_id = auth.uid());
-- FEE PAYMENTS
CREATE POLICY "Students see own payments" ON fee_payments FOR
SELECT USING (
        application_id IN (
            SELECT id
            FROM applications
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Admins can manage payments" ON fee_payments FOR ALL USING (get_user_role() = 'admin');
-- OFFER LETTERS
CREATE POLICY "Public can verify letters" ON offer_letters FOR
SELECT USING (true);
CREATE POLICY "Admins can manage letters" ON offer_letters FOR ALL USING (get_user_role() = 'admin');
-- ============================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_colleges_updated_at BEFORE
UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_applications_updated_at BEFORE
UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO profiles (id, email, full_name, role)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'student'
        )
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();