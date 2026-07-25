import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Loader2 } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError("Identifiants incorrects. Vérifiez votre email et mot de passe.")
      return
    }
    navigate('/admin')
  }

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.brandMark}>
          <div style={styles.logoCircle}>FC</div>
          <div>
            <div style={styles.brandName}>LogiFec</div>
            <div style={styles.brandSub}>Gestion de flotte — FECONDE</div>
          </div>
        </div>

        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>Chaque engin,<br/>son dossier complet.</h1>
          <p style={styles.heroDesc}>
            Inventaire, documents, maintenance et suivi carburant de la flotte FECONDE,
            centralisés et accessibles par code QR sur le terrain.
          </p>
        </div>

        <div style={styles.footerNote}>
          Femme Congolaise pour le Développement — Bunia, Ituri
        </div>
      </div>

      <div style={styles.rightPanel}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <div style={styles.cardIcon}><ShieldCheck size={22} color="var(--navy)" strokeWidth={1.75} /></div>
          <h2 style={styles.cardTitle}>Espace administration</h2>
          <p style={styles.cardSub}>Connectez-vous pour gérer la flotte.</p>

          <label style={styles.label}>Adresse email</label>
          <input
            style={styles.input}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@feconde.org"
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <Loader2 size={16} className="spin" style={{animation:'spin 0.8s linear infinite'}} /> : null}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
  },
  leftPanel: {
    background: 'linear-gradient(160deg, #142E4A 0%, #0C1E33 100%)',
    color: '#F6F4EF',
    padding: '56px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandMark: { display: 'flex', alignItems: 'center', gap: 14 },
  logoCircle: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#1F8F5F', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: '#fff' },
  brandSub: { fontSize: 12.5, color: '#B9C4D0', marginTop: 1 },
  heroText: { maxWidth: 440 },
  heroTitle: { fontSize: 40, lineHeight: 1.15, color: '#fff', fontWeight: 600, letterSpacing: '-0.01em' },
  heroDesc: { fontSize: 15.5, lineHeight: 1.6, color: '#C7D1DB', marginTop: 20 },
  footerNote: { fontSize: 12.5, color: '#8494A3', letterSpacing: '0.02em' },
  rightPanel: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--sand)', padding: 24,
  },
  card: {
    background: '#fff', borderRadius: 'var(--radius-lg)',
    padding: '40px 36px', width: '100%', maxWidth: 380,
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line-soft)',
    display: 'flex', flexDirection: 'column',
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 10, background: 'var(--emerald-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 21, marginBottom: 4 },
  cardSub: { fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 24 },
  label: { fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, marginTop: 14 },
  input: {
    border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
    padding: '11px 13px', fontSize: 14.5, outline: 'none', background: '#FCFBF9',
    transition: 'border-color 0.15s',
  },
  error: {
    marginTop: 14, fontSize: 13, color: 'var(--coral)',
    background: 'var(--coral-soft)', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  },
  submitBtn: {
    marginTop: 24, background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-sm)', padding: '12px 0', fontSize: 14.5, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'background 0.15s',
  },
}
