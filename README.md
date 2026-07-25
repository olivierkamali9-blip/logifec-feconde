# LogiFec — Gestion de flotte FECONDE

Application de gestion de flotte de véhicules pour ONG FECONDE, avec fiche par véhicule accessible via code QR.

## Contenu

- `supabase_schema.sql` — schéma complet de la base de données (tables + sécurité), à exécuter dans Supabase SQL Editor
- `GUIDE_INSTALLATION.md` — étapes détaillées pour connecter Supabase et déployer sur Vercel
- `src/` — code source de l'application (React + Vite)

## Démarrage rapide

1. Suivre `GUIDE_INSTALLATION.md` étape par étape
2. `npm install`
3. Créer `.env` avec tes clés Supabase (voir `.env.example`)
4. `npm run dev`

## Stack technique

React + Vite · Supabase (base de données, authentification, stockage fichiers) · React Router · Vercel (déploiement)
