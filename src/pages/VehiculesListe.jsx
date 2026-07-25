import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatutBadge from '../components/StatutBadge'
import { Truck, Plus, Search, ChevronRight } from 'lucide-react'

export default function VehiculesListe() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('vehicules').select('*').order('created_at', { ascending: false })
    setVehicules(data || [])
    setLoading(false)
  }

  const filtered = vehicules.filter((v) => {
    const q = query.toLowerCase()
    return (
      v.id_engin?.toLowerCase().includes(q) ||
      v.marque?.toLowerCase().includes(q) ||
      v.modele?.toLowerCase().includes(q) ||
      v.plaque_immatriculation?.toLowerCase().includes(q) ||
      v.base_affectee?.toLowerCase().includes(q)
    )
  })

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Véhicules</h1>
          <p style={styles.subtitle}>{vehicules.length} engin{vehicules.length > 1 ? 's' : ''} enregistré{vehicules.length > 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/vehicules/nouveau" style={styles.addBtn}>
          <Plus size={16} /> Ajouter un véhicule
        </Link>
      </header>

      <div style={styles.searchBar}>
        <Search size={16} color="var(--ink-soft)" />
        <input
          style={styles.searchInput}
          placeholder="Rechercher par ID, marque, modèle, plaque, base..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', marginTop: 20 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <Truck size={28} color="var(--ink-soft)" strokeWidth={1.5} />
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 10 }}>Aucun véhicule trouvé.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={styles.tableHeadRow}>
            <div style={{ width: 46 }} />
            <div style={{ flex: 2 }}>Véhicule</div>
            <div style={{ flex: 1 }}>ID Engin</div>
            <div style={{ flex: 1 }}>Plaque</div>
            <div style={{ flex: 1.2 }}>Base affectée</div>
            <div style={{ flex: 1 }}>Statut</div>
            <div style={{ width: 20 }} />
          </div>
          {filtered.map((v) => (
            <Link key={v.id} to={`/admin/vehicules/${v.id}`} style={styles.row}>
              <div style={styles.photoBox}>
                {v.photo_url ? <img src={v.photo_url} alt="" style={styles.photoImg} /> : <Truck size={16} color="var(--ink-soft)" />}
              </div>
              <div style={{ flex: 2, fontWeight: 600, color: 'var(--navy)', fontSize: 13.5 }}>
                {v.marque} {v.modele}
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 400, marginTop: 1 }}>{v.type}</div>
              </div>
              <div style={{ flex: 1, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)' }}>{v.id_engin}</div>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>{v.plaque_immatriculation || '—'}</div>
              <div style={{ flex: 1.2, fontSize: 13, color: 'var(--ink-soft)' }}>{v.base_affectee || '—'}</div>
              <div style={{ flex: 1 }}><StatutBadge statut={v.statut} /></div>
              <ChevronRight size={16} color="var(--ink-soft)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '36px 44px', maxWidth: 1200 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 5 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 7, background: 'var(--navy)', color: '#fff',
    padding: '10px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, maxWidth: 460,
  },
  searchInput: { border: 'none', outline: 'none', fontSize: 13.5, flex: 1, background: 'transparent' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  tableWrap: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
  },
  tableHeadRow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
    background: 'var(--sand)', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-soft)',
    textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--line-soft)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
    borderBottom: '1px solid var(--line-soft)',
  },
  photoBox: {
    width: 40, height: 40, borderRadius: 8, background: 'var(--sand)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
}
