import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const DOCUMENT_TYPES = [
  'Carte grise',
  'Contrôle technique',
  'Autorisation de transport des personnes',
  'Assurance',
  "PV d'expertise du véhicule",
  'Carte rose',
  'Timbre',
  'Autre',
]

export const STATUTS_VEHICULE = [
  { value: 'Actif', color: '#2C9E6F' },
  { value: 'En maintenance', color: '#E8A33D' },
  { value: 'En panne', color: '#D6455B' },
  { value: 'Hors service', color: '#6B7280' },
]
