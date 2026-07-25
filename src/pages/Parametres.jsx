import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { KeyRound, Check } from 'lucide-react'

export default function Parametres() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('parametres').select('valeur').eq('cle', 'mot_de_passe_scan').single()
    setCurrentPassword(data?.valeur || '')
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    await supabase.from('parametres').update({ valeur: newPassword, updated_at: new Date().toISOString() }).eq('cle', 'mot_de_passe_scan')
    setCurrentPassword(newPassword)
    setNewPassword('')
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={styles.page} className="lf-page">
      <header style={styles.header}>
        <h1 style={styles.title}>Paramètres</h1>
        <p style={styles.subtitle}>Configuration générale de LogiFec</p>
      </header>

      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.icon}><KeyRound size={18} color="var(--navy)" strokeWidth={1.8} /></div>
          <div>
            <h3 style={styles.cardTitle}>Mot de passe de consultation (scan QR)</h3>
            <p style={styles.cardDesc}>Ce mot de passe est demandé à toute personne qui scanne un QR code de véhicule, avant d'accéder à sa fiche.</p>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement...</p>
        ) : (
          <>
            <div style={styles.currentBox}>
              <span style={styles.currentLabel}>Mot de passe actuel</span>
              <span style={styles.currentValue}>{currentPassword}</span>
            </div>

            <form onSubmit={handleSave} style={styles.form}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <input
                style={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez le nouveau mot de passe"
                required
                minLength={4}
              />
              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {success ? <Check size={15} /> : null}
                {saving ? 'Enregistrement...' : success ? 'Mis à jour' : 'Mettre à jour'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '36px 44px', maxWidth: 720, width: '100%', boxSizing: 'border-box' },
  header: { marginBottom: 28 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 5 },
  card: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 24, boxShadow: 'var(--shadow-sm)',
  },
  cardHead: { display: 'flex', gap: 14, marginBottom: 22 },
  icon: { width: 40, height: 40, borderRadius: 10, background: 'var(--emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15.5 },
  cardDesc: { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 },
  currentBox: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--sand)', borderRadius: 8, padding: '12px 16px', marginBottom: 20,
  },
  currentLabel: { fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 },
  currentValue: { fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--navy)' },
  input: { border: '1px solid var(--line)', borderRadius: 6, padding: '10px 12px', fontSize: 13.5, outline: 'none', background: '#FCFBF9' },
  saveBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    marginTop: 6, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8,
    padding: '11px 0', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
}
