-- Cuffi Creates Studio: 2FA e detyrueshme për të dhënat (projekti xvnvzadfteklfqaiqdrq)
-- Ekzekutoje një herë te Supabase > SQL Editor > New query > Run.
--
-- Politikat RESTRICTIVE shtohen mbi politikat ekzistuese ("vetëm rreshtat e mi"):
-- një përdorues i lidhur vetëm me fjalëkalim (aal1) nuk lexon dhe nuk shkruan asgjë.
-- Vetëm pas kodit 6-shifror nga telefoni (aal2) punon sinkronizimi.
-- Mund ta ekzekutosh sërish pa problem.

-- 1) public.cuffi_sync (sinkronizimi i app.js dhe ngjyrat.html)
drop policy if exists "2fa required" on public.cuffi_sync;
create policy "2fa required"
on public.cuffi_sync
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');

-- 2) public.user_inventory (nga CUFFI-INVENTORY-SUPABASE.sql), vetëm nëse ekziston
do $$
begin
  if to_regclass('public.user_inventory') is not null then
    execute 'drop policy if exists "2fa required" on public.user_inventory';
    execute $p$
      create policy "2fa required"
      on public.user_inventory
      as restrictive
      for all
      to authenticated
      using ((select auth.jwt()->>'aal') = 'aal2')
      with check ((select auth.jwt()->>'aal') = 'aal2')
    $p$;
  end if;
end $$;

-- 3) Fotot e inventarit (bucket "inventory-images"); bucket-et e tjera nuk preken
drop policy if exists "2fa required (inventory-images)" on storage.objects;
create policy "2fa required (inventory-images)"
on storage.objects
as restrictive
for all
to authenticated
using (bucket_id <> 'inventory-images' or (select auth.jwt()->>'aal') = 'aal2')
with check (bucket_id <> 'inventory-images' or (select auth.jwt()->>'aal') = 'aal2');

-- 4) Kontroll: rls_aktiv duhet të jetë true te çdo tabelë, dhe "2fa required" duhet të dalë si RESTRICTIVE.
select c.relnamespace::regnamespace as skema,
       c.relname as tabela,
       c.relrowsecurity as rls_aktiv,
       p.polname as politika,
       case when p.polpermissive then 'PERMISSIVE' else 'RESTRICTIVE' end as lloji
from pg_class c
left join pg_policy p on p.polrelid = c.oid
where (c.relnamespace = 'public'::regnamespace and c.relname in ('cuffi_sync', 'user_inventory'))
   or (c.relnamespace = 'storage'::regnamespace and c.relname = 'objects')
order by 1, 2, 4;
