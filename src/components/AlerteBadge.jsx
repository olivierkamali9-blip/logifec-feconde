import { ALERTE_CONFIG } from '../utils/alertes'

export default function AlerteBadge({ statut, jours }) {
  if (!statut || statut === 'ok') return null
  const config = ALERTE_CONFIG[statut]
  let texte = config.label
  if (statut === 'expire') texte = `Expiré depuis ${Math.abs(jours)} j`
  else texte = `Expire dans ${jours} j`

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
      background: config.bg, color: config.color,
    }}>
      {texte}
    </span>
  )
}
