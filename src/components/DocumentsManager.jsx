import { useState } from 'react'
import { supabase, DOCUMENT_TYPES } from '../lib/supabase'
import { statutExpiration, joursRestants } from '../utils/alertes'
import AlerteBadge from './AlerteBadge'
import { Upload, FileText, Trash2, ExternalLink, X } from 'lucide-react'

export default function DocumentsManager({ vehiculeId, documents, onChange, adminId }) {
  const [showForm, setShowForm] = useState(false)
  const [typeDocument, setTypeDocument] = useState(DOCUMENT_TYPES[0])
  const [libelle, setLibelle] = useState('')
  const [dateExpiration, setDateExpiration] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) { setError('Sélectionnez un fichier.'); return }
    setError('')
    setUploading(true)

    const ext = file.name.split('.').pop()
    const safeType = typeDocument.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_')
    const path = `${vehiculeId}/${Date.now()}-${safeType}.${ext}`

    const { error: uploadError } = await supabase.storage.from('vehicule-documents').upload(path, file)
    if (uploadError) {
      setError(`Erreur lors de l'envoi du fichier : ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('vehicule-documents').getPublicUrl(path)

    const { error: insertError } = await supabase.from('documents').insert({
      vehicule_id: vehiculeId,
      type_document: typeDocument,
      libelle: typeDocument === 'Autre' ? libelle : null,
      fichier_url: urlData.publicUrl,
      nom_fichier: file.name,
      date_expiration: dateExpiration || null,
      uploaded_by: adminId || null,
    })

    setUploading(false)
    if (insertError) {
      setError(`Erreur lors de l'enregistrement du document : ${insertError.message}`)
      return
    }

    setFile(null)
    setLibelle('')
    setDateExpiration('')
    setTypeDocument(DOCUMENT_TYPES[0])
    setShowForm(false)
    onChange()
  }

  async function handleDelete(doc) {
    if (!confirm(`Supprimer le document "${doc.type_document}" ?`)) return
    await supabase.from('documents').delete().eq('id', doc.id)
    onChange()
  }

  return (
    <div>
      <div style={styles.headerRow}>
        <h3 style={styles.sectionTitle}>Documents ({documents.length})</h3>
        <button onClick={() => setShowForm((s) => !s)} style={styles.addBtn}>
          {showForm ? <X size={14} /> : <Upload size={14} />}
          {showForm ? 'Annuler' : 'Ajouter un document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} style={styles.uploadForm}>
          <div style={styles.formRow} className="lf-form-row">
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Type de document</label>
              <select value={typeDocument} onChange={(e) => setTypeDocument(e.target.value)} style={styles.select}>
                {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {typeDocument === 'Autre' && (
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Libellé</label>
                <input style={styles.input} value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Nom du document" />
              </div>
            )}
          </div>

          <div style={styles.formRow} className="lf-form-row">
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Fichier (PDF, Word ou image)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date d'expiration <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optionnelle)</span></label>
              <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} style={styles.input} />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={uploading} style={styles.submitBtn}>
            {uploading ? 'Envoi en cours...' : 'Enregistrer le document'}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>Aucun document ajouté pour ce véhicule.</p>
      ) : (
        <div style={styles.docList}>
          {documents.map((doc) => {
            const statut = statutExpiration(doc.date_expiration)
            const jours = joursRestants(doc.date_expiration)
            return (
              <div key={doc.id} style={styles.docRow}>
                <div style={styles.docIcon}><FileText size={16} color="var(--navy)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.docType}>{doc.type_document === 'Autre' ? doc.libelle : doc.type_document}</div>
                  <div style={styles.docMeta}>
                    {doc.nom_fichier}
                    {doc.date_expiration && ` · Expire le ${new Date(doc.date_expiration).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
                <AlerteBadge statut={statut} jours={jours} />
                <a href={doc.fichier_url} target="_blank" rel="noopener noreferrer" style={styles.iconBtn}>
                  <ExternalLink size={15} color="var(--navy)" />
                </a>
                <button onClick={() => handleDelete(doc)} style={styles.iconBtn}>
                  <Trash2 size={15} color="var(--coral)" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'var(--navy)', color: '#fff',
    border: 'none', borderRadius: 7, padding: '8px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  uploadForm: {
    background: 'var(--sand)', border: '1px solid var(--line-soft)', borderRadius: 10,
    padding: 18, marginBottom: 18,
  },
  formRow: { display: 'flex', gap: 14, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 5 },
  select: {
    width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '9px 10px',
    fontSize: 13, background: '#fff', outline: 'none',
  },
  input: {
    width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '9px 10px',
    fontSize: 13, background: '#fff', outline: 'none',
  },
  fileInput: { width: '100%', fontSize: 12.5 },
  error: { fontSize: 12.5, color: 'var(--coral)', marginBottom: 10 },
  submitBtn: {
    background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 7,
    padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  docList: { display: 'flex', flexDirection: 'column', gap: 6 },
  docRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    border: '1px solid var(--line-soft)', borderRadius: 8,
  },
  docIcon: {
    width: 32, height: 32, borderRadius: 7, background: 'var(--sand)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docType: { fontSize: 13, fontWeight: 600, color: 'var(--navy)' },
  docMeta: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 1 },
  iconBtn: {
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, flexShrink: 0,
  },
}
