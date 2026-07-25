# LogiFec — Guide d'installation

## 1. Créer le projet Supabase

1. Va sur https://supabase.com et connecte-toi (ou crée un compte)
2. Clique **New Project**
3. Nom : `logifec-feconde`, choisis un mot de passe fort pour la base, région : la plus proche (Europe de préférence)
4. Attends que le projet soit prêt (~2 min)

## 2. Installer le schéma de base de données

1. Dans le menu de gauche, clique **SQL Editor**
2. Clique **New query**
3. Ouvre le fichier `supabase_schema.sql` fourni, copie tout son contenu
4. Colle-le dans l'éditeur SQL et clique **Run**
5. Vérifie dans **Table Editor** que les tables `vehicules`, `documents`, `maintenances`, `ravitaillements`, `admins`, `parametres` sont créées

## 3. Créer les buckets de stockage (pour les photos et documents)

1. Menu de gauche → **Storage**
2. Clique **New bucket**, nom : `vehicule-photos`, coche **Public bucket** → Créer
3. Clique **New bucket**, nom : `vehicule-documents`, coche **Public bucket** → Créer

## 4. Créer ton premier compte admin

1. Menu de gauche → **Authentication** → **Users**
2. Clique **Add user** → **Create new user**
3. Renseigne ton email et un mot de passe → Créer
4. Copie l'**ID** (UUID) de l'utilisateur créé (colonne `UID`)
5. Retourne dans **SQL Editor**, nouvelle requête :

```sql
insert into admins (id, nom, email)
values ('COLLE_L_UUID_ICI', 'Ton Nom', 'ton.email@feconde.org');
```

6. Exécute. Ton compte admin est prêt.

## 5. Récupérer les clés API

1. Menu de gauche → **Project Settings** (icône engrenage) → **API**
2. Copie **Project URL** et la clé **anon public**

## 6. Configurer le projet

Dans le dossier du projet, crée un fichier `.env` (à partir de `.env.example`) :

```
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon_publique
```

## 7. Lancer en local pour tester

```bash
npm install
npm run dev
```

Ouvre le lien affiché (ex: http://localhost:5173), connecte-toi avec ton compte admin.

## 8. Déployer sur Vercel

1. Pousse le projet sur GitHub (nouveau repo, ex: `logifec-feconde`)
2. Va sur https://vercel.com → **Add New Project** → importe le repo
3. Dans **Environment Variables**, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (les mêmes valeurs que ton `.env`)
4. Clique **Deploy**
5. Une fois déployé, ton app est accessible à une URL du type `logifec-feconde.vercel.app`

**Important** : le lien du QR code utilise l'URL du site (`window.location.origin`). Une fois déployé sur Vercel, régénère/réimprime les QR codes si tu en avais générés en local, pour qu'ils pointent vers la bonne adresse.

## 9. Ajouter d'autres admins

Une fois connecté, va dans **Administrateurs** → **Ajouter un administrateur**. Ça crée directement le compte, pas besoin de repasser par Supabase.

## 10. Modifier le mot de passe de scan

Va dans **Paramètres** → change le mot de passe que les chauffeurs utiliseront pour consulter une fiche véhicule après scan.
