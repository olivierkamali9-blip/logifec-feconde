import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { statutExpiration, joursRestants, calculerAlertes } from '../utils/alertes'
import StatutBadge from '../components/StatutBadge'
import AlerteBadge from '../components/AlerteBadge'
import { Truck, Lock, FileText, ExternalLink, ChevronDown, ChevronUp, Gauge, Wrench, Fuel } from 'lucide-react'

export default function ScanPublic() {
  const { id } = useParams()
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const [vehicule, setVehicule] = useState(null)
  const [documents, setDocuments] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDocs, setShowDocs] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function checkVehicule() {
      const { data, error } = await supabase.from('vehicules').select('*').eq('id', id).single()
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setVehicule(data)
      setLoading(false)
    }
    checkVehicule()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    setError('')
    const { data } = await supabase.from('parametres').select('valeur').eq('cle', 'mot_de_passe_scan').single()
    setChecking(false)
    if (data && data.valeur === password) {
      setAuthorized(true)
      loadDetails()
    } else {
      setError('Mot de passe incorrect.')
    }
  }

  async function loadDetails() {
    const { data: docs } = await supabase.from('documents').select('*').eq('vehicule_id', id)
    const { data: maints } = await supabase.from('maintenances').select('*').eq('vehicule_id', id).order('date_maintenance', { ascending: false }).limit(5)
    setDocuments(docs || [])
    setMaintenances(maints || [])
  }

  if (loading) return <div style={styles.centerPage}><p style={{ color: 'var(--ink-soft)' }}>Chargement...</p></div>

  if (notFound) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.notFoundCard}>
          <Truck size={28} color="var(--ink-soft)" strokeWidth={1.5} />
          <h2 style={{ fontSize: 17, marginTop: 12 }}>Véhicule introuvable</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>Ce code QR ne correspond à aucun véhicule enregistré.</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={styles.centerPage}>
        <form onSubmit={handleSubmit} style={styles.passCard}>
          <div style={styles.passIcon}><Lock size={20} color="var(--navy)" strokeWidth={1.8} /></div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Accès au véhicule</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>Entrez le mot de passe pour consulter la fiche.</p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            style={styles.passInput}
          />
          {error && <div style={styles.errorMsg}>{error}</div>}
          <button type="submit" disabled={checking} style={styles.passBtn}>
            {checking ? 'Vérification...' : 'Accéder à la fiche'}
          </button>
        </form>
      </div>
    )
  }

  const alertes = calculerAlertes([{ ...vehicule, documents }])

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div style={styles.brandMini}>
          <img src="/logo-feconde.png" alt="Logo FECONDE" style={styles.logoImg} />
          <span style={styles.brandText}>LogiFec — FECONDE</span>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.heroCard}>
          <div style={styles.heroPhoto}>
            {vehicule.photo_url ? <img src={vehicule.photo_url} alt="" style={styles.heroImg} /> : <Truck size={32} color="var(--ink-soft)" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.heroTopRow}>
              <span style={styles.idEngin}>{vehicule.id_engin}</span>
              <StatutBadge statut={vehicule.statut} />
            </div>
            <h1 style={styles.heroTitle}>{vehicule.marque} {vehicule.modele}</h1>
            <p style={styles.heroSub}>{vehicule.plaque_immatriculation} · {vehicule.type}</p>
          </div>
        </div>

        {alertes.length > 0 && (
          <div style={styles.alerteBanner}>
            {alertes.length} document{alertes.length > 1 ? 's' : ''} à surveiller — voir la section Documents ci-dessous.
          </div>
        )}

        <div style={styles.dashRow} className="lf-dash-row">
          <MiniStat icon={Gauge} label="Base affectée" value={vehicule.base_affectee || '—'} />
          <MiniStat icon={Wrench} label="Chauffeur principal" value={vehicule.chauffeur_principal || '—'} />
          <MiniStat icon={Fuel} label="Carburant" value={vehicule.type_carburant || '—'} />
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Informations du véhicule</h3>
          <div style={styles.infoGrid}>
            <InfoItem label="Catégorie" value={vehicule.categorie} />
            <InfoItem label="Année de fabrication" value={vehicule.annee_fabrication} />
            <InfoItem label="Couleur" value={vehicule.couleur} />
            <InfoItem label="N° châssis" value={vehicule.numero_chassis} />
            <InfoItem label="N° moteur" value={vehicule.numero_moteur} />
            <InfoItem label="Capacité réservoir" value={vehicule.capacite_reservoir ? `${vehicule.capacite_reservoir} L` : null} />
            <InfoItem label="Responsable de base" value={vehicule.responsable_base} />
            <InfoItem label="Date d'affectation" value={formatDate(vehicule.date_affectation)} />
            <InfoItem label="Compagnie d'assurance" value={vehicule.compagnie_assurance} />
            <InfoItem label="Expiration assurance" value={formatDate(vehicule.date_expiration_assurance)} />
          </div>
          {vehicule.commentaire && (
            <div style={styles.commentBox}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 4, textTransform: 'uppercase' }}>Commentaire</div>
              {vehicule.commentaire}
            </div>
          )}
        </div>

        <div style={styles.infoCard}>
          <button onClick={() => setShowDocs((s) => !s)} style={styles.docsToggle}>
            <span style={styles.sectionTitle}>Documents ({documents.length})</span>
            {showDocs ? <ChevronUp size={18} color="var(--navy)" /> : <ChevronDown size={18} color="var(--navy)" />}
          </button>
          {showDocs && (
            <div style={{ marginTop: 14 }}>
              {documents.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucun document disponible.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {documents.map((doc) => {
                    const statut = statutExpiration(doc.date_expiration)
                    const jours = joursRestants(doc.date_expiration)
                    return (
                      <a key={doc.id} href={doc.fichier_url} target="_blank" rel="noopener noreferrer" style={styles.docRow}>
                        <div style={styles.docIcon}><FileText size={15} color="var(--navy)" /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.docType}>{doc.type_document === 'Autre' ? doc.libelle : doc.type_document}</div>
                          {doc.date_expiration && <div style={styles.docMeta}>Expire le {formatDate(doc.date_expiration)}</div>}
                        </div>
                        <AlerteBadge statut={statut} jours={jours} />
                        <ExternalLink size={14} color="var(--ink-soft)" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {maintenances.length > 0 && (
          <div style={styles.infoCard}>
            <h3 style={styles.sectionTitle}>Dernières interventions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {maintenances.map((m) => (
                <div key={m.id} style={styles.maintRow}>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600, minWidth: 90 }}>{formatDate(m.date_maintenance)}</div>
                  <div style={{ fontSize: 13 }}>{m.travaux_effectues || m.description_panne || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div style={styles.miniStat}>
      <Icon size={16} color="var(--navy)" strokeWidth={1.8} />
      <div>
        <div style={styles.miniStatLabel}>{label}</div>
        <div style={styles.miniStatValue}>{value}</div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value || '—'}</div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('fr-FR')
}

const styles = {
  centerPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', padding: 20 },
  notFoundCard: { background: '#fff', borderRadius: 16, padding: 36, textAlign: 'center', boxShadow: 'var(--shadow-md)' },
  passCard: {
    background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 360,
    boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  passIcon: { width: 44, height: 44, borderRadius: 12, background: 'var(--emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  passInput: {
    width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '11px 13px',
    fontSize: 14.5, outline: 'none', textAlign: 'center', background: '#FCFBF9',
  },
  errorMsg: { fontSize: 12.5, color: 'var(--coral)', marginTop: 10 },
  passBtn: {
    marginTop: 16, width: '100%', background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  page: { minHeight: '100vh', background: 'var(--sand)' },
  headerBar: { background: 'var(--navy-deep)', padding: '14px 20px' },
  brandMini: { display: 'flex', alignItems: 'center', gap: 10, maxWidth: 640, margin: '0 auto' },
  logoImg: { width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#fff', flexShrink: 0 },
  logoCircle: {
    width: 28, height: 28, borderRadius: '50%', background: 'var(--emerald)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
  },
  brandText: { color: '#fff', fontSize: 13.5, fontWeight: 600 },
  container: { maxWidth: 640, margin: '0 auto', padding: '24px 18px 60px', display: 'flex', flexDirection: 'column', gap: 16 },
  heroCard: {
    background: '#fff', borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'center',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--line-soft)',
  },
  heroPhoto: {
    width: 76, height: 76, borderRadius: 12, background: 'var(--sand)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroTopRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 },
  idEngin: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 },
  heroTitle: { fontSize: 19 },
  heroSub: { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 3 },
  alerteBanner: {
    background: 'var(--amber-soft)', color: '#8A5A16', fontSize: 13, fontWeight: 600,
    padding: '11px 16px', borderRadius: 10,
  },
  dashRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  miniStat: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 12, padding: '14px 12px',
    display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start',
  },
  miniStatLabel: { fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' },
  miniStatValue: { fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginTop: 2 },
  infoCard: { background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-sm)' },
  sectionTitle: { fontSize: 15 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 },
  infoLabel: { fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' },
  infoValue: { fontSize: 13.5, color: 'var(--ink)', marginTop: 3, fontWeight: 500 },
  commentBox: { marginTop: 16, padding: '12px 14px', background: 'var(--sand)', borderRadius: 8, fontSize: 13 },
  docsToggle: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
  },
  docRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    border: '1px solid var(--line-soft)', borderRadius: 8,
  },
  docIcon: { width: 30, height: 30, borderRadius: 7, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docType: { fontSize: 13, fontWeight: 600, color: 'var(--navy)' },
  docMeta: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 1 },
  maintRow: { display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--line-soft)' },
}
