import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()

  const migrations = [
    // Subscription tiers table
    `CREATE TABLE IF NOT EXISTS public.subscription_tiers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      max_clients int NOT NULL DEFAULT 5,
      max_projects_per_client int NOT NULL DEFAULT 5,
      created_at timestamptz DEFAULT now()
    )`,

    // Creator subscriptions table
    `CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      tier_id uuid NOT NULL REFERENCES public.subscription_tiers(id),
      status text NOT NULL DEFAULT 'trial',
      trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
      created_at timestamptz DEFAULT now(),
      UNIQUE(creator_id)
    )`,

    // Creator-client relationships
    `CREATE TABLE IF NOT EXISTS public.creator_clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      client_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
      client_email text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz DEFAULT now(),
      UNIQUE(creator_id, client_email)
    )`,

    // Client project access
    `CREATE TABLE IF NOT EXISTS public.client_project_access (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      granted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now(),
      UNIQUE(client_id, project_id)
    )`,

    // Add review_password column to projects if not exists
    `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS review_password text`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_creator ON public.creator_subscriptions(creator_id)`,
    `CREATE INDEX IF NOT EXISTS idx_creator_clients_creator ON public.creator_clients(creator_id)`,
    `CREATE INDEX IF NOT EXISTS idx_creator_clients_client ON public.creator_clients(client_id)`,
    `CREATE INDEX IF NOT EXISTS idx_creator_clients_email ON public.creator_clients(client_email)`,
    `CREATE INDEX IF NOT EXISTS idx_client_project_access_client ON public.client_project_access(client_id)`,
    `CREATE INDEX IF NOT EXISTS idx_client_project_access_project ON public.client_project_access(project_id)`,

    // RLS on new tables
    `ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.creator_clients ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.client_project_access ENABLE ROW LEVEL SECURITY`,

    // RLS policies - subscription_tiers (read-only for everyone)
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_tiers' AND policyname = 'Public read for tiers') THEN
        CREATE POLICY "Public read for tiers" ON public.subscription_tiers FOR SELECT USING (true);
      END IF;
    END $$`,

    // RLS policies - creator_subscriptions
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_subscriptions' AND policyname = 'Creators read own subscription') THEN
        CREATE POLICY "Creators read own subscription" ON public.creator_subscriptions FOR SELECT USING (auth.uid() = creator_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_subscriptions' AND policyname = 'Creators insert own subscription') THEN
        CREATE POLICY "Creators insert own subscription" ON public.creator_subscriptions FOR INSERT WITH CHECK (auth.uid() = creator_id);
      END IF;
    END $$`,

    // RLS policies - creator_clients
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_clients' AND policyname = 'Creators manage own clients') THEN
        CREATE POLICY "Creators manage own clients" ON public.creator_clients FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = client_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_clients' AND policyname = 'Creators insert clients') THEN
        CREATE POLICY "Creators insert clients" ON public.creator_clients FOR INSERT WITH CHECK (auth.uid() = creator_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_clients' AND policyname = 'Creators update own clients') THEN
        CREATE POLICY "Creators update own clients" ON public.creator_clients FOR UPDATE USING (auth.uid() = creator_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_clients' AND policyname = 'Creators delete own clients') THEN
        CREATE POLICY "Creators delete own clients" ON public.creator_clients FOR DELETE USING (auth.uid() = creator_id);
      END IF;
    END $$`,

    // RLS policies - client_project_access
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_project_access' AND policyname = 'Access visible to grantor and client') THEN
        CREATE POLICY "Access visible to grantor and client" ON public.client_project_access FOR SELECT USING (auth.uid() = client_id OR auth.uid() = granted_by);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_project_access' AND policyname = 'Creators grant access') THEN
        CREATE POLICY "Creators grant access" ON public.client_project_access FOR INSERT WITH CHECK (auth.uid() = granted_by);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_project_access' AND policyname = 'Creators revoke access') THEN
        CREATE POLICY "Creators revoke access" ON public.client_project_access FOR DELETE USING (auth.uid() = granted_by);
      END IF;
    END $$`,

    // Seed subscription tiers
    `INSERT INTO public.subscription_tiers (name, max_clients, max_projects_per_client)
     VALUES
       ('Starter', 5, 5),
       ('Professional', 20, 15),
       ('Business', 999999, 999999)
     ON CONFLICT (name) DO NOTHING`,
  ]

  const results = []
  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).single()
    if (error) {
      results.push({ sql: sql.slice(0, 60), error: error.message })
    } else {
      results.push({ sql: sql.slice(0, 60), ok: true })
    }
  }

  return NextResponse.json({ results })
}
