-- ============================================================
-- LOGIFEC - Schéma base de données Supabase
-- Gestion de flotte FECONDE
-- ============================================================

-- 1. TABLE ADMINS (profils liés aux comptes Supabase Auth)
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  email text not null unique,
  invite_par uuid references admins(id),
  created_at timestamptz default now()
);

-- 2. TABLE PARAMETRES (mot de passe de scan, modifiable par l'admin)
create table parametres (
  cle text primary key,
  valeur text not null,
  updated_at timestamptz default now()
);

insert into parametres (cle, valeur) values ('mot_de_passe_scan', 'FECONDE2026');

-- 3. TABLE VEHICULES
create table vehicules (
  id uuid primary key default gen_random_uuid(),
  id_engin text not null unique,           -- ex: VEH-FEC-001
  photo_url text,

  -- Identification
  type text,
  categorie text,
  marque text,
  modele text,
  annee_fabrication text,
  numero_chassis text,
  numero_moteur text,
  plaque_immatriculation text,
  couleur text,

  -- Technique
  type_carburant text,
  capacite_reservoir text,

  -- Affectation
  base_affectee text,
  chauffeur_principal text,
  responsable_base text,
  date_affectation date,
  statut text default 'Actif',             -- Actif / En panne / En maintenance / Hors service

  -- Achat
  date_acquisition date,
  valeur_achat numeric,
  fournisseur text,
  source_financement text,

  -- Assurance (résumé rapide, le document complet est dans "documents")
  compagnie_assurance text,
  date_expiration_assurance date,

  commentaire text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references admins(id)
);

-- 4. TABLE DOCUMENTS (fichiers réels : carte grise, assurance, etc.)
create table documents (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid references vehicules(id) on delete cascade,
  type_document text not null,   -- Carte grise / Contrôle technique / Autorisation transport personnes /
                                   -- Assurance / PV d'expertise / Carte rose / Timbre / Autre
  libelle text,                   -- libellé libre si "Autre"
  fichier_url text not null,
  nom_fichier text,
  date_expiration date,           -- optionnelle
  uploaded_at timestamptz default now(),
  uploaded_by uuid references admins(id)
);

-- 5. TABLE MAINTENANCES (historique)
create table maintenances (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid references vehicules(id) on delete cascade,
  date_maintenance date,
  description_panne text,
  travaux_effectues text,
  pieces_remplacees text,
  fournisseur_pieces text,
  garage_technicien text,
  cout_main_oeuvre numeric,
  cout_pieces numeric,
  cout_total numeric,
  kilometrage_maintenance numeric,
  immobilisation_jours integer,
  created_at timestamptz default now()
);

-- 6. TABLE RAVITAILLEMENTS (historique carburant)
create table ravitaillements (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid references vehicules(id) on delete cascade,
  date_ravitaillement date,
  station_service text,
  quantite numeric,
  kilometrage_avant numeric,
  consommation_moyenne numeric,
  conducteur text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table admins enable row level security;
alter table parametres enable row level security;
alter table vehicules enable row level security;
alter table documents enable row level security;
alter table maintenances enable row level security;
alter table ravitaillements enable row level security;

-- ADMINS : un admin connecté peut tout lire, et créer d'autres admins
create policy "admins_select" on admins for select using (auth.uid() is not null);
create policy "admins_insert" on admins for insert with check (auth.uid() is not null);

-- PARAMETRES : lecture publique (la page de scan doit vérifier le mot de passe),
-- écriture réservée aux admins connectés
create policy "parametres_select_public" on parametres for select using (true);
create policy "parametres_update_admin" on parametres for update using (auth.uid() is not null);

-- VEHICULES : lecture publique (nécessaire pour la page de scan), écriture admin uniquement
create policy "vehicules_select_public" on vehicules for select using (true);
create policy "vehicules_insert_admin" on vehicules for insert with check (auth.uid() is not null);
create policy "vehicules_update_admin" on vehicules for update using (auth.uid() is not null);
create policy "vehicules_delete_admin" on vehicules for delete using (auth.uid() is not null);

-- DOCUMENTS : lecture publique, écriture admin uniquement
create policy "documents_select_public" on documents for select using (true);
create policy "documents_insert_admin" on documents for insert with check (auth.uid() is not null);
create policy "documents_update_admin" on documents for update using (auth.uid() is not null);
create policy "documents_delete_admin" on documents for delete using (auth.uid() is not null);

-- MAINTENANCES : lecture publique, écriture admin uniquement
create policy "maintenances_select_public" on maintenances for select using (true);
create policy "maintenances_insert_admin" on maintenances for insert with check (auth.uid() is not null);
create policy "maintenances_update_admin" on maintenances for update using (auth.uid() is not null);
create policy "maintenances_delete_admin" on maintenances for delete using (auth.uid() is not null);

-- RAVITAILLEMENTS : lecture publique, écriture admin uniquement
create policy "ravitaillements_select_public" on ravitaillements for select using (true);
create policy "ravitaillements_insert_admin" on ravitaillements for insert with check (auth.uid() is not null);
create policy "ravitaillements_update_admin" on ravitaillements for update using (auth.uid() is not null);
create policy "ravitaillements_delete_admin" on ravitaillements for delete using (auth.uid() is not null);

-- ============================================================
-- STORAGE BUCKETS (à créer aussi via l'interface Supabase > Storage)
-- - "vehicule-photos"  (public)
-- - "vehicule-documents" (public)
-- ============================================================
