-- ============================================================
-- LOGIFEC - Renforcement sécurité : seuls les comptes présents
-- dans la table "admins" peuvent écrire, pas n'importe quel
-- utilisateur Auth connecté.
-- ============================================================

-- Fonction utilitaire : l'utilisateur connecté est-il un admin actif ?
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from admins where id = auth.uid());
$$ language sql security definer stable;

-- VEHICULES
drop policy if exists "vehicules_insert_admin" on vehicules;
drop policy if exists "vehicules_update_admin" on vehicules;
drop policy if exists "vehicules_delete_admin" on vehicules;
create policy "vehicules_insert_admin" on vehicules for insert with check (is_admin());
create policy "vehicules_update_admin" on vehicules for update using (is_admin());
create policy "vehicules_delete_admin" on vehicules for delete using (is_admin());

-- DOCUMENTS
drop policy if exists "documents_insert_admin" on documents;
drop policy if exists "documents_update_admin" on documents;
drop policy if exists "documents_delete_admin" on documents;
create policy "documents_insert_admin" on documents for insert with check (is_admin());
create policy "documents_update_admin" on documents for update using (is_admin());
create policy "documents_delete_admin" on documents for delete using (is_admin());

-- MAINTENANCES
drop policy if exists "maintenances_insert_admin" on maintenances;
drop policy if exists "maintenances_update_admin" on maintenances;
drop policy if exists "maintenances_delete_admin" on maintenances;
create policy "maintenances_insert_admin" on maintenances for insert with check (is_admin());
create policy "maintenances_update_admin" on maintenances for update using (is_admin());
create policy "maintenances_delete_admin" on maintenances for delete using (is_admin());

-- RAVITAILLEMENTS
drop policy if exists "ravitaillements_insert_admin" on ravitaillements;
drop policy if exists "ravitaillements_update_admin" on ravitaillements;
drop policy if exists "ravitaillements_delete_admin" on ravitaillements;
create policy "ravitaillements_insert_admin" on ravitaillements for insert with check (is_admin());
create policy "ravitaillements_update_admin" on ravitaillements for update using (is_admin());
create policy "ravitaillements_delete_admin" on ravitaillements for delete using (is_admin());

-- PARAMETRES
drop policy if exists "parametres_update_admin" on parametres;
create policy "parametres_update_admin" on parametres for update using (is_admin());

-- ADMINS (seuls les admins peuvent ajouter/supprimer d'autres admins)
drop policy if exists "admins_insert" on admins;
create policy "admins_insert" on admins for insert with check (is_admin());
create policy "admins_delete" on admins for delete using (is_admin());

-- STORAGE : photos et documents
drop policy if exists "photos_insert_admin" on storage.objects;
drop policy if exists "photos_update_admin" on storage.objects;
drop policy if exists "photos_delete_admin" on storage.objects;
create policy "photos_insert_admin" on storage.objects for insert
  with check (bucket_id = 'vehicule-photos' and is_admin());
create policy "photos_update_admin" on storage.objects for update
  using (bucket_id = 'vehicule-photos' and is_admin());
create policy "photos_delete_admin" on storage.objects for delete
  using (bucket_id = 'vehicule-photos' and is_admin());

drop policy if exists "documents_bucket_insert_admin" on storage.objects;
drop policy if exists "documents_bucket_update_admin" on storage.objects;
drop policy if exists "documents_bucket_delete_admin" on storage.objects;
create policy "documents_bucket_insert_admin" on storage.objects for insert
  with check (bucket_id = 'vehicule-documents' and is_admin());
create policy "documents_bucket_update_admin" on storage.objects for update
  using (bucket_id = 'vehicule-documents' and is_admin());
create policy "documents_bucket_delete_admin" on storage.objects for delete
  using (bucket_id = 'vehicule-documents' and is_admin());
