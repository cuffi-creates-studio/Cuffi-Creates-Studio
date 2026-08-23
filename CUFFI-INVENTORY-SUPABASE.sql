-- Ekzekutoje një herë te Supabase > SQL Editor > New query > Run

create table if not exists public.user_inventory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inventory jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_inventory enable row level security;

drop policy if exists "inventory_select_own" on public.user_inventory;
create policy "inventory_select_own"
on public.user_inventory for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "inventory_insert_own" on public.user_inventory;
create policy "inventory_insert_own"
on public.user_inventory for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "inventory_update_own" on public.user_inventory;
create policy "inventory_update_own"
on public.user_inventory for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "inventory_delete_own" on public.user_inventory;
create policy "inventory_delete_own"
on public.user_inventory for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('inventory-images', 'inventory-images', true)
on conflict (id) do update set public = true;

drop policy if exists "inventory_images_insert_own" on storage.objects;
create policy "inventory_images_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'inventory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "inventory_images_update_own" on storage.objects;
create policy "inventory_images_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'inventory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'inventory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "inventory_images_delete_own" on storage.objects;
create policy "inventory_images_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'inventory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
