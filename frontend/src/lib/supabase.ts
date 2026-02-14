import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Type definitions matching our Supabase schema
export type UserRole = 'student' | 'counselor' | 'admin';

export type ApplicationStatus =
    | 'draft'
    | 'pending'
    | 'under_review'
    | 'verified'
    | 'college_allocated'
    | 'admitted'
    | 'rejected';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'reupload_required';

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface College {
    id: string;
    name: string;
    location: string;
    country: string;
    streams: string[];
    description: string | null;
    logo_url: string | null;
    website: string | null;
    contact_email: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Application {
    id: string;
    user_id: string;
    college_id: string | null;
    counselor_id: string | null;
    status: ApplicationStatus;
    stream: string | null;
    program: string | null;
    intake_year: number | null;
    total_fees: number;
    paid_fees: number;
    notes: string | null;
    personal_info: Record<string, unknown>;
    academic_info: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    // Joined
    college?: College;
    profile?: Profile;
}

export interface Document {
    id: string;
    application_id: string;
    user_id: string;
    doc_type: string;
    original_name: string;
    storage_path: string;
    file_size: number | null;
    mime_type: string | null;
    status: DocumentStatus;
    rejection_reason: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    link: string | null;
    created_at: string;
}

export interface FeePayment {
    id: string;
    application_id: string;
    amount: number;
    payment_date: string;
    method: string;
    reference_number: string | null;
    receipt_url: string | null;
    notes: string | null;
    recorded_by: string | null;
    created_at: string;
}

export interface OfferLetter {
    id: string;
    application_id: string;
    student_name: string;
    college_name: string;
    program: string | null;
    issue_date: string;
    pdf_url: string | null;
    is_valid: boolean;
    generated_by: string | null;
    created_at: string;
}

// Status display helpers
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    draft: 'Draft',
    pending: 'Pending Review',
    under_review: 'Under Review',
    verified: 'Verified',
    college_allocated: 'College Allocated',
    admitted: 'Admitted',
    rejected: 'Rejected',
};

export const STATUS_STEPS: ApplicationStatus[] = [
    'draft',
    'pending',
    'under_review',
    'verified',
    'college_allocated',
    'admitted',
];
