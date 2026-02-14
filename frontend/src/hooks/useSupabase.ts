"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { Application, Profile, College, Document as DocType, Notification as NotifType } from "@/lib/supabase";

// ───────────────────────────────────────────────────
// Generic fetch hook with caching and real-time
// ───────────────────────────────────────────────────

type QueryResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

function useSupabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>,
    deps: unknown[] = []
): QueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await queryFn();
        if (error) setError(error.message);
        else setData(data);
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// ───────────────────────────────────────────────────
// Auth Hook
// ───────────────────────────────────────────────────

export function useUser() {
    const supabase = createClient();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user ? { id: user.id, email: user.email } : null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return { user, loading };
}

// ───────────────────────────────────────────────────
// Profile Hook
// ───────────────────────────────────────────────────

export function useProfile(userId: string | undefined) {
    const supabase = createClient();

    return useSupabaseQuery<Profile>(
        () =>
            supabase
                .from("profiles")
                .select("*")
                .eq("id", userId || "")
                .single() as unknown as Promise<{ data: Profile | null; error: { message: string } | null }>,
        [userId]
    );
}

// ───────────────────────────────────────────────────
// Applications Hook
// ───────────────────────────────────────────────────

export function useApplication(userId: string | undefined) {
    const supabase = createClient();

    return useSupabaseQuery<Application>(
        () =>
            supabase
                .from("applications")
                .select("*, college:colleges(*)")
                .eq("user_id", userId || "")
                .order("created_at", { ascending: false })
                .limit(1)
                .single() as unknown as Promise<{ data: Application | null; error: { message: string } | null }>,
        [userId]
    );
}

export function useAllApplications(filters?: { status?: string; stream?: string }) {
    const supabase = createClient();

    return useSupabaseQuery<(Application & { profile?: Profile })[]>(
        () => {
            let query = supabase
                .from("applications")
                .select("*, profile:profiles!applications_user_id_fkey(*), college:colleges(*)")
                .order("created_at", { ascending: false });

            if (filters?.status) query = query.eq("status", filters.status);
            if (filters?.stream) query = query.eq("stream", filters.stream);

            return query as unknown as Promise<{ data: (Application & { profile?: Profile })[] | null; error: { message: string } | null }>;
        },
        [filters?.status, filters?.stream]
    );
}

// ───────────────────────────────────────────────────
// Colleges Hook
// ───────────────────────────────────────────────────

export function useColleges(activeOnly = false) {
    const supabase = createClient();

    return useSupabaseQuery<College[]>(
        () => {
            let query = supabase.from("colleges").select("*").order("name");
            if (activeOnly) query = query.eq("is_active", true);
            return query as unknown as Promise<{ data: College[] | null; error: { message: string } | null }>;
        },
        [activeOnly]
    );
}

// ───────────────────────────────────────────────────
// Documents Hook
// ───────────────────────────────────────────────────

export function useDocuments(userId: string | undefined) {
    const supabase = createClient();

    return useSupabaseQuery<DocType[]>(
        () =>
            supabase
                .from("documents")
                .select("*")
                .eq("user_id", userId || "")
                .order("created_at", { ascending: false }) as unknown as Promise<{ data: DocType[] | null; error: { message: string } | null }>,
        [userId]
    );
}

// ───────────────────────────────────────────────────
// Notifications Hook with Real-Time
// ───────────────────────────────────────────────────

export function useNotifications(userId: string | undefined) {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<NotifType[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (data) {
            setNotifications(data as NotifType[]);
            setUnreadCount((data as NotifType[]).filter((n) => !n.is_read).length);
        }
        setLoading(false);
    }, [supabase, userId]);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time notifications
        if (userId) {
            channelRef.current = supabase
                .channel(`notifications:${userId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const newNotif = payload.new as NotifType;
                        setNotifications((prev) => [newNotif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    }
                )
                .subscribe();
        }

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [fetchNotifications, supabase, userId]);

    const markAsRead = useCallback(
        async (notifId: string) => {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", notifId);

            setNotifications((prev) =>
                prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        },
        [supabase]
    );

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }, [supabase, userId]);

    return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}

// ───────────────────────────────────────────────────
// Real-Time Application Status Hook
// ───────────────────────────────────────────────────

export function useApplicationRealtime(applicationId: string | undefined) {
    const supabase = createClient();
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) return;

        const channel = supabase
            .channel(`app-status:${applicationId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "applications",
                    filter: `id=eq.${applicationId}`,
                },
                (payload) => {
                    setStatus((payload.new as { status: string }).status);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, applicationId]);

    return { status };
}
