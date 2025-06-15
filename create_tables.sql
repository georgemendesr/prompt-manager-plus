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

-- Adicionar categorias iniciais 
insert into public.text_categories (name)
values ('ChatGPT'), ('Claude'), ('Gemini'), ('Experts'), ('Texto'), ('LLM'), ('AI'), ('Super Prompts');

-- Adicionar categorias iniciais para imagens
insert into public.image_categories (name)
values ('Midjourney'), ('Stable Diffusion'), ('DALL-E'), ('Imagens');

-- Adicionar categorias iniciais para música
insert into public.music_categories (name)
values ('Suno'), ('AudioCraft'), ('Música');

-- Adicionar a categoria Experts à tabela text_categories
insert into public.text_categories (name, type)
values ('Experts', 'text');

-- Também corrigir tipo da categoria Experts na tabela legada (se existir)
update public.categories 
set type = 'text' 
where name = 'Experts';

-- Tabela de prompts de imagem com camadas e tipos
create table if not exists public.image_prompts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references image_categories(id) on delete set null,
  title text,
  type text not null check (type in ('photo','video','design')),
  blocks jsonb not null default '[]'::jsonb,
  ai_hint text,
  created_at timestamptz default now()
);

-- Políticas de acesso para image_prompts
alter table public.image_prompts enable row level security;

create policy "public_read" on public.image_prompts
  for select using (true);

create policy "service_insert" on public.image_prompts
  for insert with check (auth.role() = 'service_role'); 