import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Mail, X, Trash2 } from 'lucide-react'

export default function Administrateurs() {
  const { adminProfile } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: true })
    setAdmins(data || [])
    setLoading(false)
  }

  async function handleDelete(admin) {
    if (admin.id === adminProfile?.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.")
      return
    }
    if (!confirm(`Retirer l'accès administrateur de ${admin.nom} (${admin.email}) ?\n\nSon compte de connexion restera visible dans Supabase Authentication (à supprimer manuellement là-bas si besoin), mais il perdra tout accès à LogiFec.`)) return

    setDeletingId(admin.id)
    const { error } = await supabase.from('admins').delete().eq('id', admin.id)
    setDeletingId(null)
    if (error) {
      alert(`Erreur lors de la suppression : ${error.message}`)
      return
    }
    load()
  }

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message.includes('already') ? 'Cet email est déjà utilisé.' : "Erreur lors de la création du compte.")
      setSubmitting(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('admins').insert({
        id: data.user.id,
        nom,
        email,
        invite_par: adminProfile?.id,
      })
      if (profileError) {
        setError("Compte créé mais erreur lors de l'enregistrement du profil.")
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)
    setSuccess(`${nom} a été ajouté comme administrateur.`)
    setNom('')
    setEmail('')
    setPassword('')
    setShowForm(false)
    load()
  }

  return (
    <div style={styles.page} className="lf-page">
      <header style={styles.header} className="lf-page-header">
        <div>
          <h1 style={styles.title}>Administrateurs</h1>
          <p style={styles.subtitle}>Personnes ayant accès à la gestion de la flotte</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} style={styles.addBtn}>
          {showForm ? <X size={15} /> : <UserPlus size={15} />}
          {showForm ? 'Annuler' : 'Ajouter un administrateur'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleInvite} style={styles.formCard}>
          <div style={styles.formRow} className="lf-form-row">
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Nom complet</label>
              <input style={styles.input} required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Godgive Alimwimana" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Email</label>
              <input type="email" style={styles.input} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@feconde.org" />
            </div>
          </div>
          <div style={styles.formRow} className="lf-form-row">
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Mot de passe temporaire</label>
              <input type="text" style={styles.input} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Au moins 6 caractères" />
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Création...' : "Créer l'accès administrateur"}
          </button>
        </form>
      )}

      {success && <div style={styles.success}>{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--ink-soft)' }}>Chargement...</p>
      ) : (
        <div style={styles.list}>
          {admins.map((a) => (
            <div key={a.id} style={styles.row}>
              <div style={styles.avatar}>{a.nom?.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.name}>{a.nom} {a.id === adminProfile?.id && <span style={styles.youTag}>vous</span>}</div>
                <div style={styles.email}><Mail size={11} /> {a.email}</div>
              </div>
              <div style={styles.dateAdded}>Depuis le {new Date(a.created_at).toLocaleDateString('fr-FR')}</div>
              {a.id !== adminProfile?.id && (
                <button onClick={() => handleDelete(a)} disabled={deletingId === a.id} style={styles.deleteIconBtn}>
                  <Trash2 size={15} color="var(--coral)" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '36px 44px', maxWidth: 900, width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 5 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 7, background: 'var(--navy)', color: '#fff',
    border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  formCard: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 22, marginBottom: 20, boxShadow: 'var(--shadow-sm)',
  },
  formRow: { display: 'flex', gap: 14, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 5 },
  input: { width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '9px 10px', fontSize: 13.5, outline: 'none', background: '#FCFBF9' },
  error: { fontSize: 12.5, color: 'var(--coral)', marginBottom: 12 },
  success: { fontSize: 13, color: 'var(--emerald)', background: 'var(--emerald-soft)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  submitBtn: {
    background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 7,
    padding: '10px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  list: { background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  row: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--line-soft)' },
  avatar: {
    width: 38, height: 38, borderRadius: '50%', background: 'var(--navy)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  name: { fontSize: 14, fontWeight: 600, color: 'var(--navy)' },
  youTag: { fontSize: 10.5, background: 'var(--emerald-soft)', color: 'var(--emerald)', padding: '2px 7px', borderRadius: 10, marginLeft: 8, fontWeight: 700 },
  email: { fontSize: 12.5, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 },
  dateAdded: { fontSize: 12, color: 'var(--ink-soft)' },
  deleteIconBtn: {
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, flexShrink: 0, marginLeft: 8,
  },
}
