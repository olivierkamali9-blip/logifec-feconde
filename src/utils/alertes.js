import { differenceInCalendarDays, parseISO } from 'date-fns'

// Renvoie le statut d'expiration d'un document
// 'expire' | 'urgent' (<=15j) | 'proche' (<=30j) | 'ok' | null (pas de date)
export function statutExpiration(dateExpiration) {
  if (!dateExpiration) return null
  const jours = differenceInCalendarDays(parseISO(dateExpiration), new Date())
  if (jours < 0) return 'expire'
  if (jours <= 15) return 'urgent'
  if (jours <= 30) return 'proche'
  return 'ok'
}

export function joursRestants(dateExpiration) {
  if (!dateExpiration) return null
  return differenceInCalendarDays(parseISO(dateExpiration), new Date())
}

export const ALERTE_CONFIG = {
  expire: { label: 'Expiré', color: '#C43D52', bg: '#FAE6E9' },
  urgent: { label: 'Expire bientôt', color: '#C43D52', bg: '#FAE6E9' },
  proche: { label: 'À renouveler', color: '#D9932E', bg: '#FBF0DD' },
  ok: { label: 'En règle', color: '#1F8F5F', bg: '#E4F5EC' },
}

// Calcule toutes les alertes actives pour une liste de véhicules (avec leurs documents joints)
export function calculerAlertes(vehicules) {
  const alertes = []
  for (const v of vehicules) {
    for (const doc of v.documents || []) {
      const statut = statutExpiration(doc.date_expiration)
      if (statut === 'expire' || statut === 'urgent' || statut === 'proche') {
        alertes.push({
          vehiculeId: v.id,
          idEngin: v.id_engin,
          typeDocument: doc.type_document,
          dateExpiration: doc.date_expiration,
          statut,
          jours: joursRestants(doc.date_expiration),
        })
      }
    }
  }
  return alertes.sort((a, b) => a.jours - b.jours)
}
