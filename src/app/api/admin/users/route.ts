import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string;
  provider: string;
  isConfirmed: boolean;
}

export async function GET() {
  try {
    const configured = isSupabaseConfigured();

    // 1. Attempt admin query using service_role key if available
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (configured && serviceKey && !serviceKey.includes('your-supabase-service-role-key')) {
      try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.auth.admin.listUsers();

        if (!error && data?.users) {
          const mappedUsers: DashboardUser[] = data.users.map((u) => {
            const meta = u.user_metadata || {};
            const provider = u.app_metadata?.provider || 'email';
            return {
              id: u.id,
              email: u.email || '',
              fullName: meta.full_name || meta.name || u.email?.split('@')[0] || 'Security Analyst',
              role: meta.role || 'Enterprise Security Analyst',
              createdAt: u.created_at,
              lastSignInAt: u.last_sign_in_at,
              provider,
              isConfirmed: Boolean(u.email_confirmed_at),
            };
          });

          return NextResponse.json({
            users: mappedUsers,
            total: mappedUsers.length,
            source: 'supabase_auth_admin',
            configured: true,
          });
        }
      } catch (adminErr) {
        console.warn('Admin listUsers failed, falling back to profiles/session:', adminErr);
      }
    }

    // 2. Query the public.profiles table using server client
    const serverSupabase = await createServerSupabaseClient();

    // Fetch current caller session
    const { data: { user: currentUser } } = await serverSupabase.auth.getUser();

    try {
      const { data: profiles, error: profileErr } = await serverSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profileErr && profiles && profiles.length > 0) {
        const mappedProfiles: DashboardUser[] = profiles.map((p) => ({
          id: p.id,
          email: p.email || (currentUser && currentUser.id === p.id ? currentUser.email || '' : ''),
          fullName: p.full_name || p.name || 'Security Analyst',
          role: p.role || 'Enterprise Security Analyst',
          createdAt: p.created_at,
          lastSignInAt: p.updated_at || p.created_at,
          provider: 'supabase',
          isConfirmed: true,
        }));

        return NextResponse.json({
          users: mappedProfiles,
          total: mappedProfiles.length,
          source: 'supabase_profiles_table',
          configured,
        });
      }
    } catch {
      // profiles table might not exist yet
    }

    // 3. Fallback: Return current active session user if present
    if (currentUser) {
      const meta = currentUser.user_metadata || {};
      const fallbackList: DashboardUser[] = [
        {
          id: currentUser.id,
          email: currentUser.email || '',
          fullName: meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'Active Analyst',
          role: meta.role || 'Enterprise Security Analyst',
          createdAt: currentUser.created_at,
          lastSignInAt: currentUser.last_sign_in_at,
          provider: currentUser.app_metadata?.provider || 'email',
          isConfirmed: Boolean(currentUser.email_confirmed_at),
        },
      ];

      return NextResponse.json({
        users: fallbackList,
        total: fallbackList.length,
        source: 'supabase_session_user',
        configured,
      });
    }

    // 4. Default mock/demo fallback when not signed in
    return NextResponse.json({
      users: [],
      total: 0,
      source: 'unauthenticated',
      configured,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query users';
    return NextResponse.json({ error: message, users: [], total: 0 }, { status: 500 });
  }
}
