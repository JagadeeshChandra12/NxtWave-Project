import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registrationService } from '../services/registrationService'
import { getConfig } from '../lib/config'
import { formatWorkshopDateTime } from '../lib/datetime'
import { useAuth } from '../lib/auth'
import Button from '../components/ui/Button'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  college: z.string().min(2),
  branch: z.string().min(2),
  graduationYear: z.coerce.number().min(2020, 'Select your graduation year').max(2030, 'Select your graduation year'),
  phone: z.string().optional(),
  projectIdea: z.string().optional(),
  referralCode: z.string().optional(),
  consent: z.boolean().refine(v => v === true, 'Consent required'),
})
type V = z.infer<typeof schema>

export default function WorkshopPage() {
  const [params] = useSearchParams()
  const cfg = getConfig()
  const { user } = useAuth()
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: { graduationYear: undefined as any, consent: false },
  })

  useEffect(() => {
    const rc = params.get('ref') || params.get('referral_code') || sessionStorage.getItem('bl60_ref') || ''
    if (rc) { setValue('referralCode', rc); sessionStorage.setItem('bl60_ref', rc) }
    const src = params.get('utm_source') || params.get('source')
    if (src) sessionStorage.setItem('bl60_source', src)
    const med = params.get('utm_medium') || params.get('medium')
    if (med) sessionStorage.setItem('bl60_medium', med)
    const cmp = params.get('utm_campaign') || params.get('campaign')
    if (cmp) sessionStorage.setItem('bl60_campaign', cmp)
    // preserve across navigation already in URL
    if (user?.email) setValue('email', user.email)
    if (user?.name) setValue('fullName', user.name)
  }, [params, setValue, user])

  const onSubmit = async (values: V) => {
    setLoading(true); setError(null)
    try {
      const reg = await registrationService.create({
        fullName: values.fullName, email: values.email, college: values.college, branch: values.branch,
        graduationYear: values.graduationYear, phone: values.phone, projectIdea: values.projectIdea,
        referralCode: values.referralCode, consent: values.consent,
        source: params.get('utm_source') || params.get('source') || sessionStorage.getItem('bl60_source') || undefined,
        medium: params.get('utm_medium') || params.get('medium') || sessionStorage.getItem('bl60_medium') || undefined,
        campaign: params.get('utm_campaign') || params.get('campaign') || sessionStorage.getItem('bl60_campaign') || undefined,
        referringPage: document.referrer || undefined,
      })
      setSuccess(reg)
    } catch (e: any) {
      if (e?.message === 'DUPLICATE') setError('This email is already registered. Use your existing registration.')
      else setError(e?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <div className="label-mono mb-2">Registration confirmed</div>
          <h1 className="font-display text-4xl font-bold">You're in.</h1>
          <p className="mt-4 text-ink/70">Thanks, {success.fullName}. Your registration ID is <span className="font-mono text-cobalt">{success.id}</span>.</p>
          <p className="text-sm text-ink/60 mt-2">Save this ID to access your details and certificates later.</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link to="/planner" className="btn-primary">Back to planner</Link>
            <Link to="/build-battle" className="btn-ghost">Explore Build Battle</Link>
          </div>
          <p className="text-xs font-mono text-ink/50 mt-6">{cfg.demoMode ? 'Demo mode: no confirmation email sent.' : 'A confirmation email will be sent if an email provider is configured.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="label-mono mb-2">The Workshop</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold">{cfg.workshopTitle}</h1>
      <p className="text-ink/70 mt-2">{cfg.workshopDescription}</p>
      <div className="card p-4 mt-4 text-sm font-mono text-ink/60">
        Workshop: {formatWorkshopDateTime()} · Trainer: {cfg.trainer || 'To be announced'}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label-mono block mb-1">Full name *</label><input {...register('fullName')} className="w-full border-2 border-ink p-3" />{errors.fullName && <p className="text-coral text-sm">{errors.fullName.message}</p>}</div>
          <div><label className="label-mono block mb-1">Email *</label><input type="email" {...register('email')} className="w-full border-2 border-ink p-3" />{errors.email && <p className="text-coral text-sm">{errors.email.message}</p>}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label-mono block mb-1">College / university *</label><input {...register('college')} className="w-full border-2 border-ink p-3" />{errors.college && <p className="text-coral text-sm">{errors.college.message}</p>}</div>
          <div><label className="label-mono block mb-1">Degree / branch *</label><input {...register('branch')} className="w-full border-2 border-ink p-3" />{errors.branch && <p className="text-coral text-sm">{errors.branch.message}</p>}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label-mono block mb-1">Graduation year *</label><select {...register('graduationYear')} className="w-full border-2 border-ink p-3 bg-white"><option value="">Select year</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option></select>{errors.graduationYear && <p className="text-coral text-sm">{errors.graduationYear.message}</p>}</div>
          <div><label className="label-mono block mb-1">Phone (optional)</label><input {...register('phone')} className="w-full border-2 border-ink p-3" /></div>
        </div>
        <div><label className="label-mono block mb-1">Current project idea (optional)</label><input {...register('projectIdea')} className="w-full border-2 border-ink p-3" /></div>
        <div><label className="label-mono block mb-1">Referral code (optional)</label><input {...register('referralCode')} className="w-full border-2 border-ink p-3" /></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" {...register('consent')} className="mt-1" /> I consent to the privacy notice and agree to be contacted about the workshop.</label>
        {errors.consent && <p className="text-coral text-sm">{errors.consent.message}</p>}
        {error && <p className="text-coral text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Reserve My Free Spot</Button>
      </form>
    </div>
  )
}








