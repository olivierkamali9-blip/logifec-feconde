import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calculerAlertes } from '../utils/alertes'
import StatutBadge from '../components/StatutBadge'
import AlerteBadge from '../components/AlerteBadge'
import { Truck, AlertTriangle, Wrench, Ban, Plus, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: vs } = await supabase.from('vehicules').select('*').order('created_at', { ascending: false })
    const { data: docs } = await supabase.from('documents').select('*')
    const enriched = (vs || []).map((v) => ({
      ...v,
      documents: (docs || []).filter((d) => d.vehicule_id === v.id),
    }))
    setVehicules(enriched)
    setLoading(false)
  }

  const total = vehicules.length
  const actifs = vehicules.filter((v) => v.statut === 'Actif').length
  const enMaintenance = vehicules.filter((v) => v.statut === 'En maintenance' || v.statut === 'En panne').length
  const horsService = vehicules.filter((v) => v.statut === 'Hors service').length
  const alertes = calculerAlertes(vehicules)

  if (loading) return <div style={styles.page}><p style={{color:'var(--ink-soft)'}}>Chargement...</p></div>

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de bord</h1>
          <p style={styles.subtitle}>Vue d'ensemble de la flotte FECONDE</p>
        </div>
        <Link to="/admin/vehicules/nouveau" style={styles.addBtn}>
          <Plus size={16} /> Ajouter un véhicule
        </Link>
      </header>

      <div style={styles.statsGrid}>
        <StatCard icon={Truck} label="Véhicules enregistrés" value={total} color="var(--navy)" />
        <StatCard icon={Truck} label="Actifs" value={actifs} color="var(--emerald)" />
        <StatCard icon={Wrench} label="En maintenance / panne" value={enMaintenance} color="var(--amber)" />
        <StatCard icon={Ban} label="Hors service" value={horsService} color="var(--coral)" />
      </div>

      <div style={styles.grid2}>
        <div style={styles.panel}>
          <div style={styles.panelHead}>
            <AlertTriangle size={16} color="var(--coral)" />
            <h3 style={styles.panelTitle}>Alertes documents</h3>
            <span style={styles.countPill}>{alertes.length}</span>
          </div>
          {alertes.length === 0 ? (
            <p style={styles.emptyText}>Aucune alerte. Tous les documents suivis sont en règle.</p>
          ) : (
            <div style={styles.alerteList}>
              {alertes.slice(0, 8).map((a, i) => (
                <Link key={i} to={`/admin/vehicules/${a.vehiculeId}`} style={styles.alerteRow}>
                  <div>
                    <div style={styles.alerteEngin}>{a.idEngin}</div>
                    <div style={styles.alerteDoc}>{a.typeDocument}</div>
                  </div>
                  <AlerteBadge statut={a.statut} jours={a.jours} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHead}>
            <Truck size={16} color="var(--navy)" />
            <h3 style={styles.panelTitle}>Véhicules récents</h3>
          </div>
          {vehicules.length === 0 ? (
            <p style={styles.emptyText}>Aucun véhicule enregistré pour l'instant.</p>
          ) : (
            <div style={styles.vehiculeList}>
              {vehicules.slice(0, 6).map((v) => (
                <Link key={v.id} to={`/admin/vehicules/${v.id}`} style={styles.vehiculeRow}>
                  <div style={styles.vehiculePhoto}>
                    {v.photo_url ? <img src={v.photo_url} alt="" style={styles.vehiculeImg} /> : <Truck size={16} color="var(--ink-soft)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.vehiculeNom}>{v.marque} {v.modele}</div>
                    <div style={styles.vehiculeId}>{v.id_engin}</div>
                  </div>
                  <StatutBadge statut={v.statut} />
                  <ChevronRight size={16} color="var(--ink-soft)" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: `${color}14` }}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '36px 44px', maxWidth: 1200 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 5 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 7, background: 'var(--navy)', color: '#fff',
    padding: '10px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)',
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-display)' },
  statLabel: { fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  panel: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 22, boxShadow: 'var(--shadow-sm)',
  },
  panelHead: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 },
  panelTitle: { fontSize: 15, flex: 1 },
  countPill: {
    background: 'var(--coral-soft)', color: 'var(--coral)', fontSize: 11.5, fontWeight: 700,
    padding: '2px 9px', borderRadius: 20,
  },
  emptyText: { fontSize: 13, color: 'var(--ink-soft)', padding: '8px 0' },
  alerteList: { display: 'flex', flexDirection: 'column', gap: 2 },
  alerteRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 10px', borderRadius: 8, transition: 'background 0.12s',
  },
  alerteEngin: { fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' },
  alerteDoc: { fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 },
  vehiculeList: { display: 'flex', flexDirection: 'column', gap: 2 },
  vehiculeRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 8,
  },
  vehiculePhoto: {
    width: 38, height: 38, borderRadius: 8, background: 'var(--sand)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
  },
  vehiculeImg: { width: '100%', height: '100%', objectFit: 'cover' },
  vehiculeNom: { fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  vehiculeId: { fontSize: 11.5, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' },
}
