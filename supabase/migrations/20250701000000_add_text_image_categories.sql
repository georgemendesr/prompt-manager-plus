-- Text categories
create table if not exists public.text_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references text_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for text_categories
alter table public.text_categories enable row level security;
create policy "anon read" on public.text_categories
  for select using (true);
create policy "anon insert" on public.text_categories
  for insert with check (true);
create policy "anon update" on public.text_categories
  for update using (true);
create policy "anon delete" on public.text_categories
  for delete using (true);

-- Image categories
create table if not exists public.image_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references image_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for image_categories
alter table public.image_categories enable row level security;
create policy "anon read" on public.image_categories
  for select using (true);
create policy "anon insert" on public.image_categories
  for insert with check (true);
create policy "anon update" on public.image_categories
  for update using (true);
create policy "anon delete" on public.image_categories
  for delete using (true);

-- Music categories
create table if not exists public.music_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references music_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for music_categories
alter table public.music_categories enable row level security;
create policy "anon read" on public.music_categories
  for select using (true);
create policy "anon insert" on public.music_categories
  for insert with check (true);
create policy "anon update" on public.music_categories
  for update using (true);
create policy "anon delete" on public.music_categories
  for delete using (true);

-- Text prompts
create table if not exists public.text_prompts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references text_categories(id),
  title text,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS for text_prompts
alter table public.text_prompts enable row level security;

create policy "public_read" on public.text_prompts
  for select using (true);

create policy "service_insert" on public.text_prompts
  for insert with check (true);

create policy "service_update" on public.text_prompts
  for update using (true);

create policy "service_delete" on public.text_prompts
  for delete using (true); 