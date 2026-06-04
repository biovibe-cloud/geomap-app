-- ============================================================
-- MIGRACIÓN 001 — Esquema inicial GeoMap App
-- Ejecutar en Supabase SQL Editor en el orden indicado
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA profiles (extiende auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "usuarios ven solo su perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuarios editan solo su perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: crea perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. TABLA maps
-- ------------------------------------------------------------
create table if not exists public.maps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false not null,
  embed_token_hash text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.maps enable row level security;

create index if not exists idx_maps_user_id on public.maps(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger maps_updated_at
  before update on public.maps
  for each row execute procedure public.set_updated_at();

create policy "dueño ve sus mapas"
  on public.maps for select
  using (auth.uid() = user_id);

create policy "mapas públicos son visibles a todos"
  on public.maps for select
  using (is_public = true);

create policy "dueño crea mapas"
  on public.maps for insert
  with check (auth.uid() = user_id);

create policy "dueño edita sus mapas"
  on public.maps for update
  using (auth.uid() = user_id);

create policy "dueño borra sus mapas"
  on public.maps for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. TABLA images
-- ------------------------------------------------------------
create table if not exists public.images (
  id uuid default gen_random_uuid() primary key,
  map_id uuid references public.maps(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cloudinary_public_id text not null,
  filename_original text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  taken_at timestamptz,
  has_gps boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.images enable row level security;

create index if not exists idx_images_map_id  on public.images(map_id);
create index if not exists idx_images_user_id on public.images(user_id);
create index if not exists idx_images_gps     on public.images(map_id)
  where has_gps = true;

create policy "dueño ve sus imágenes"
  on public.images for select
  using (auth.uid() = user_id);

create policy "imágenes de mapas públicos son visibles"
  on public.images for select
  using (
    exists (
      select 1 from public.maps
      where maps.id = images.map_id
        and maps.is_public = true
    )
  );

create policy "dueño inserta imágenes"
  on public.images for insert
  with check (auth.uid() = user_id);

create policy "dueño borra sus imágenes"
  on public.images for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. TABLA embed_access_log
-- ------------------------------------------------------------
create table if not exists public.embed_access_log (
  id bigserial primary key,
  map_id uuid references public.maps(id) on delete cascade not null,
  accessed_at timestamptz default now() not null,
  ip_hash text,
  user_agent_short text
);

alter table public.embed_access_log enable row level security;

create index if not exists idx_embed_log_map_id
  on public.embed_access_log(map_id);
create index if not exists idx_embed_log_time
  on public.embed_access_log(accessed_at desc);