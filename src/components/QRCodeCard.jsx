import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, ImageRun, AlignmentType } from 'docx'
import { Download, FileText } from 'lucide-react'

export default function QRCodeCard({ vehicule }) {
  const cardRef = useRef(null)
  const scanUrl = `${window.location.origin}/scan/${vehicule.id}`

  async function telechargerImage() {
    const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: '#ffffff' })
    canvas.toBlob((blob) => {
      saveAs(blob, `QR-${vehicule.id_engin}.png`)
    })
  }

  async function telechargerWord() {
    const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: '#ffffff' })
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: bytes,
                transformation: { width: 320, height: 380 },
              }),
            ],
          }),
        ],
      }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `QR-${vehicule.id_engin}.docx`)
  }

  return (
    <div>
      <div ref={cardRef} style={styles.card}>
        <div style={styles.cardHeader}>LOGIFEC — FECONDE</div>
        <div style={styles.qrWrap}>
          <QRCodeCanvas value={scanUrl} size={180} level="H" fgColor="#142E4A" />
        </div>
        <div style={styles.idEngin}>{vehicule.id_engin}</div>
        <div style={styles.vehiculeNom}>{vehicule.marque} {vehicule.modele}</div>
        <div style={styles.plaque}>{vehicule.plaque_immatriculation || ''}</div>
      </div>

      <div style={styles.actions}>
        <button onClick={telechargerImage} style={styles.btn}>
          <Download size={15} /> Télécharger (image)
        </button>
        <button onClick={telechargerWord} style={styles.btnOutline}>
          <FileText size={15} /> Télécharger (Word)
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    width: 260, background: '#fff', border: '2px solid #142E4A', borderRadius: 12,
    padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    margin: '0 auto',
  },
  cardHeader: {
    fontSize: 11, fontWeight: 700, color: '#142E4A', letterSpacing: '0.08em',
    marginBottom: 14, textTransform: 'uppercase',
  },
  qrWrap: { padding: 10, background: '#fff', border: '1px solid #E3E1DA', borderRadius: 8 },
  idEngin: {
    fontSize: 17, fontWeight: 700, color: '#142E4A', marginTop: 14,
    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em',
  },
  vehiculeNom: { fontSize: 13.5, color: '#1A2430', marginTop: 4, fontWeight: 600 },
  plaque: { fontSize: 12, color: '#55606D', marginTop: 2 },
  actions: { display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' },
  btn: {
    display: 'flex', alignItems: 'center', gap: 7, background: 'var(--navy)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  btnOutline: {
    display: 'flex', alignItems: 'center', gap: 7, background: '#fff', color: 'var(--navy)',
    border: '1px solid var(--line)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
}
