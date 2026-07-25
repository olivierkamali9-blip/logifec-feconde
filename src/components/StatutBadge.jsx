import { STATUTS_VEHICULE } from '../lib/supabase'

export default function StatutBadge({ statut }) {
  const config = STATUTS_VEHICULE.find((s) => s.value === statut) || STATUTS_VEHICULE[0]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      background: `${config.color}18`, color: config.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
      {statut || 'Actif'}
    </span>
  )
}
