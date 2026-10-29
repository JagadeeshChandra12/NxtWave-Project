import { useState } from 'react'
import { certificateService } from '../services/certificateService'
import { registrationService } from '../services/registrationService'
import Button from '../components/ui/Button'

export default function CertificatePage() {
  const [regId, setRegId] = useState('')
  const [cert, setCert] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const lookup = async () => {
    const regs = await registrationService.all()
    const reg = regs.find((r:any) => r.id === regId)
    if (!reg) { setMsg('Registration not found'); setCert(null); return }
    if (!reg.attendanceVerified) { setMsg('Attendance not yet verified. Certificate unavailable.'); setCert(null); return }
    const c = await certificateService.byRegistration(reg.id)
    if (!c) { setMsg('Certificate not issued yet. Please contact the organizer.'); setCert(null); return }
    setCert(c); setMsg('')
  }
  const print = () => window.print()
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="label-mono mb-2">Certificates</div>
      <h1 className="font-display text-4xl font-bold">Workshop participation certificate</h1>
      <p className="text-ink/70 mt-2">Enter your registration ID to access your certificate. Certificates are issued only after attendance verification.</p>
      <div className="flex gap-2 mt-4">
        <input value={regId} onChange={e=>setRegId(e.target.value)} className="flex-1 border-2 border-ink p-3" placeholder="Registration ID" />
        <Button onClick={lookup}>Lookup</Button>
      </div>
      {msg && <p className="text-coral text-sm mt-2">{msg}</p>}
      {cert && (
        <div className="mt-6">
          <div className="card p-8 print-area" style={{ aspectRatio: '1.414/1' }}>
            <div className="text-center">
              <div className="label-mono">Certificate of Participation</div>
              <h2 className="font-display text-3xl font-bold mt-4">{cert.participantName}</h2>
              <p className="mt-2 text-sm">participated in</p>
              <h3 className="font-display text-2xl font-bold mt-2">{cert.workshopTitle}</h3>
              <p className="text-sm mt-2">Date: {cert.date || 'To be announced'}</p>
              <p className="text-xs font-mono mt-4">Certificate ID: {cert.certificateId}</p>
              <p className="text-xs font-mono text-ink/50 mt-2">Created with BuildLab 60</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={print}>Print / Save PDF</Button>
          </div>
        </div>
      )}
    </div>
  )
}

