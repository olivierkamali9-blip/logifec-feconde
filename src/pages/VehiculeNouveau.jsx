import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FORM_SECTIONS } from '../utils/formFields'
import { genererIdEngin } from '../utils/idEngin'
import { ArrowLeft, Camera, Save, Truck, Loader2 } from 'lucide-react'

const emptyForm = {
  id_engin: '', type: '', categorie: '', marque: '', modele: '', annee_fabrication: '',
  numero_chassis: '', numero_moteur: '', plaque_immatriculation: '', couleur: '',
  type_carburant: '', capacite_reservoir: '', base_affectee: '', chauffeur_principal: '',
  responsable_base: '', date_affectation: '', statut: 'Actif', date_acquisition: '',
  valeur_achat: '', fournisseur: '', source_financement: '', compagnie_assurance: '',
  date_expiration_assurance: '', commentaire: '',
}

export default function VehiculeNouveau() {
  const navigate = useNavigate()
  const { adminProfile } = useAuth()

  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function init() {
      const newId = await genererIdEngin()
      if (!cancelled) {
        setForm((f) => ({ ...f, id_engin: newId }))
        setReady(true)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  function handleFieldChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handlePhotoSelect(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 8 * 1024 * 1024) {
      setError("La photo est trop lourde (max 8 Mo). Choisissez une photo plus légère.")
      return
    }
    setError('')
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const validCreatorId = adminProfile?.id && adminProfile.id !== 'undefined' ? adminProfile.id : null
    if (!validCreatorId) {
      setError("Profil administrateur non chargé. Rechargez la page et réessayez.")
      setSaving(false)
      return
    }

    let photoUrl = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const safeIdEngin = (form.id_engin || 'vehicule').replace(/[^a-zA-Z0-9-]/g, '_')
      const path = `${safeIdEngin}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('vehicule-photos').upload(path, photoFile, { upsert: true })
      if (uploadError) {
        setError(`Erreur lors de l'envoi de la photo : ${uploadError.message}`)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('vehicule-photos').getPublicUrl(path)
      photoUrl = urlData.publicUrl
    }

    const payload = { photo_url: photoUrl, id_engin: form.id_engin, statut: form.statut || 'Actif', created_by: validCreatorId }
    FORM_SECTIONS.forEach((section) => {
      section.fields.forEach((f) => {
        let value = form[f.key]
        if (f.type === 'date' && (value === '' || value === undefined)) value = null
        if (f.type === 'number') value = value === '' || value === undefined ? null : Number(value)
        if (value === undefined) value = null
        payload[f.key] = value
      })
    })

    const { data, error: insertError } = await supabase.from('vehicules').insert(payload).select().single()
    setSaving(false)
    if (insertError) {
      setError(`Erreur lors de la création : ${insertError.message}`)
      return
    }
    navigate(`/admin/vehicules/${data.id}`, { replace: true })
  }

  if (!ready) return <div style={styles.page}><p style={{ color: 'var(--ink-soft)' }}>Préparation du formulaire...</p></div>

  return (
    <div style={styles.page} className="lf-page">
      <Link to="/admin/vehicules" style={styles.backLink}>
        <ArrowLeft size={15} /> Retour aux véhicules
      </Link>

      <div style={styles.layout} className="lf-fiche-layout">
        <form onSubmit={handleSave} style={styles.formCol}>
          <div style={styles.topCard}>
            <div style={styles.photoUpload}>
              <label htmlFor="photo-input" style={styles.photoLabel}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Véhicule" style={styles.photoImg} />
                ) : (
                  <div style={styles.photoPlaceholder}><Truck size={26} color="var(--ink-soft)" /></div>
                )}
                <div style={styles.photoOverlay}><Camera size={16} color="#fff" /></div>
              </label>
              <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={styles.idRow}>
                <span style={styles.idEngin}>{form.id_engin}</span>
              </div>
              <h1 style={styles.title}>Nouveau véhicule</h1>
              <p style={styles.subtitle}>Remplissez les informations disponibles, vous pourrez compléter plus tard.</p>
            </div>
          </div>

          {FORM_SECTIONS.map((section) => (
            <div key={section.title} style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={styles.fieldsGrid} className="lf-fields-grid">
                {section.fields.map((f) => (
                  <div key={f.key} style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                    <label style={styles.label}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select style={styles.input} value={form[f.key] || ''} onChange={(e) => handleFieldChange(f.key, e.target.value)}>
                        <option value="">—</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea style={{ ...styles.input, minHeight: 70, resize: 'vertical' }} value={form[f.key] || ''} onChange={(e) => handleFieldChange(f.key, e.target.value)} />
                    ) : (
                      <input
                        type={f.type}
                        style={styles.input}
                        value={form[f.key] || ''}
                        placeholder={f.placeholder}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actionsRow}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={15} />}
              {saving ? 'Création...' : 'Créer le véhicule'}
            </button>
          </div>
        </form>

        <div style={styles.sideCol}>
          <div style={styles.sideCard}>
            <p style={styles.sideDesc}>Enregistrez le véhicule pour générer son code QR et ajouter ses documents.</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  page: { padding: '32px 44px 60px', maxWidth: 1200, width: '100%', boxSizing: 'border-box' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20, fontWeight: 500 },
  layout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 },
  sideCol: { display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 24, minWidth: 0 },
  topCard: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 22, display: 'flex', gap: 18, alignItems: 'center', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap',
  },
  photoUpload: { position: 'relative', flexShrink: 0 },
  photoLabel: { display: 'block', width: 84, height: 84, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoPlaceholder: { width: '100%', height: '100%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(20,46,74,0.7)',
    padding: '4px 0', display: 'flex', justifyContent: 'center',
  },
  idRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  idEngin: { fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 },
  title: { fontSize: 21 },
  subtitle: { fontSize: 13, color: 'var(--ink-soft)', marginTop: 3 },
  sectionCard: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 22, boxShadow: 'var(--shadow-sm)',
  },
  sectionTitle: { fontSize: 15, marginBottom: 16 },
  fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 5 },
  input: {
    width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '9px 10px',
    fontSize: 13.5, background: '#FCFBF9', outline: 'none',
  },
  error: { fontSize: 13, color: 'var(--coral)', background: 'var(--coral-soft)', padding: '10px 14px', borderRadius: 8 },
  actionsRow: { display: 'flex', gap: 12 },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  sideCard: {
    background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
    padding: 22, boxShadow: 'var(--shadow-sm)',
  },
  sideDesc: { fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.5 },
}
