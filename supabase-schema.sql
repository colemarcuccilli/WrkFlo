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
