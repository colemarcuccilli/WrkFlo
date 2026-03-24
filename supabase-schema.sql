-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text default 'creator',
  created_at timestamptz default now()
);

-- Projects table
create table public.projects (
  id uuid not null default uuid_generate_v4() primary key,
  name text not null,
  creator_id uuid references public.users(id) on delete set null,
  status text default 'Draft',
  review_token uuid unique default uuid_generate_v4(),
  client_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Files table
create table public.files (
  id uuid not null default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  type text,
  version text default 'V1',
  status text default 'draft',
  storage_path text,
  url text,
  duration int,
  upload_date date,
  created_at timestamptz default now()
);

-- File versions table
create table public.file_versions (
  id uuid not null default uuid_generate_v4() primary key,
  file_id uuid references public.files(id) on delete cascade,
  version_label text,
  notes text,
  storage_path text,
  created_at timestamptz default now()
);

-- Comments table
create table public.comments (
  id uuid not null default uuid_generate_v4() primary key,
  file_id uuid references public.files(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  author_name text not null,
  author_role text default 'client',
  content text not null,
  timestamp_data jsonb,
  created_at timestamptz default now()
);

-- Project members table
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text,
  primary key (project_id, user_id)
);

-- Indexes on foreign key columns
create index idx_projects_creator_id on public.projects(creator_id);
create index idx_projects_review_token on public.projects(review_token);
create index idx_files_project_id on public.files(project_id);
create index idx_file_versions_file_id on public.file_versions(file_id);
create index idx_comments_file_id on public.comments(file_id);
create index idx_comments_author_id on public.comments(author_id);
create index idx_project_members_user_id on public.project_members(user_id);

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.files enable row level security;
alter table public.file_versions enable row level security;
alter table public.comments enable row level security;
alter table public.project_members enable row level security;

-- RLS Policies for public.users
create policy "Public read access for users" on public.users for select using (true);
create policy "Users can insert their own record" on public.users for insert with check (auth.uid() = id);
create policy "Users can update own record" on public.users for update using (auth.uid() = id);

-- RLS Policies for public.projects
create policy "Public read access for projects" on public.projects for select using (true);
create policy "Authenticated users can insert projects" on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Users can update own projects" on public.projects for update using (auth.uid() = creator_id or exists (select 1 from public.project_members where project_id = public.projects.id and user_id = auth.uid()));

-- RLS Policies for public.files
create policy "Public read access for files" on public.files for select using (true);
create policy "Authenticated users can insert files" on public.files for insert with check (auth.role() = 'authenticated');
create policy "Users can update own files" on public.files for update using (auth.uid() = (select creator_id from public.projects where id = public.files.project_id) or exists (select 1 from public.project_members pm join public.projects p on pm.project_id = p.id where pm.project_id = public.files.project_id and pm.user_id = auth.uid()));

-- RLS Policies for public.file_versions
create policy "Public read access for file_versions" on public.file_versions for select using (true);
create policy "Authenticated users can insert file_versions" on public.file_versions for insert with check (auth.role() = 'authenticated');
create policy "Users can update own file_versions" on public.file_versions for update using (auth.role() = 'authenticated');

-- RLS Policies for public.comments
create policy "Public read access for comments" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can update own comments" on public.comments for update using (auth.uid() = author_id);

-- RLS Policies for public.project_members
create policy "Public read access for project_members" on public.project_members for select using (true);
create policy "Authenticated users can insert project_members" on public.project_members for insert with check (auth.role() = 'authenticated');
create policy "Users can update own project memberships" on public.project_members for update using (auth.uid() = user_id);

-- Trigger function to handle new user creation
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'creator'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Trigger function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at on projects
create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure update_updated_at_column();


-- Waitlist table (landing page early access)
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- ── Client Account System ─────────────────────────────────────────────────────

-- Subscription tiers
create table if not exists public.subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  max_clients int not null default 5,
  max_projects_per_client int not null default 5,
  created_at timestamptz default now()
);

-- Creator subscriptions
create table if not exists public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  tier_id uuid not null references public.subscription_tiers(id),
  status text not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  unique(creator_id)
);

-- Creator-client relationships
create table if not exists public.creator_clients (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.users(id) on delete set null,
  client_email text not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  unique(creator_id, client_email)
);

-- Client project access
create table if not exists public.client_project_access (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  granted_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  unique(client_id, project_id)
);

-- Indexes for client system
create index if not exists idx_creator_subscriptions_creator on public.creator_subscriptions(creator_id);
create index if not exists idx_creator_clients_creator on public.creator_clients(creator_id);
create index if not exists idx_creator_clients_client on public.creator_clients(client_id);
create index if not exists idx_creator_clients_email on public.creator_clients(client_email);
create index if not exists idx_client_project_access_client on public.client_project_access(client_id);
create index if not exists idx_client_project_access_project on public.client_project_access(project_id);

-- RLS on client system tables
alter table public.subscription_tiers enable row level security;
alter table public.creator_subscriptions enable row level security;
alter table public.creator_clients enable row level security;
alter table public.client_project_access enable row level security;

-- Seed tiers
insert into public.subscription_tiers (name, max_clients, max_projects_per_client)
values ('Starter', 5, 5), ('Professional', 20, 15), ('Business', 999999, 999999)
on conflict (name) do nothing;

-- ── Cloud Storage Integration ────────────────────────────────────────────────

-- Add cloud storage columns to files table
ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS storage_type text DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS mime_type text;

-- Unified cloud token storage (Google Drive, Dropbox, OneDrive)
CREATE TABLE IF NOT EXISTS public.user_cloud_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider text NOT NULL,  -- 'google_drive', 'dropbox', 'onedrive'
  access_token text NOT NULL,
  refresh_token text,
  token_expiry timestamptz,
  account_email text,
  account_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_cloud_tokens_user_id ON public.user_cloud_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cloud_tokens_provider ON public.user_cloud_tokens(user_id, provider);

ALTER TABLE public.user_cloud_tokens ENABLE ROW LEVEL SECURITY;

-- Migrate existing Google Drive tokens (run once)
-- INSERT INTO public.user_cloud_tokens (user_id, provider, access_token, refresh_token, token_expiry, account_email, updated_at)
-- SELECT user_id, 'google_drive', access_token, refresh_token, token_expiry, google_email, updated_at
-- FROM public.user_drive_tokens
-- ON CONFLICT (user_id, provider) DO NOTHING;

-- ── Review Password Protection ─────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS review_password text;

-- ── Comment Replies ─────────────────────────────────────────────────────
-- Add parent_id for threaded replies
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- ── BUG-017: Add missing description and due_date columns ─────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS due_date date;

-- ── BUG-018: Add creator_name denormalized column ─────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS creator_name text;

-- ── Bug Reports (Beta Testing) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  description text NOT NULL,
  url text,
  browser_info text,
  viewport text,
  user_email text,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert bug_reports"
  ON public.bug_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can read bug_reports"
  ON public.bug_reports FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- ── Beta Invites ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.beta_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid REFERENCES public.users(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read beta_invites" ON public.beta_invites
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert beta_invites" ON public.beta_invites
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update beta_invites" ON public.beta_invites
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_beta_invites_email ON public.beta_invites(email);

-- ── Activity Tracking (Beta Analytics) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage activity_log"
  ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_category ON public.activity_log(category);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);

-- ── Feedback Responses (Beta Milestone Prompts) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  user_email text,
  prompt_type text NOT NULL,
  rating integer,
  feedback text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert feedback"
  ON public.feedback_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read feedback"
  ON public.feedback_responses FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback_responses(prompt_type);
