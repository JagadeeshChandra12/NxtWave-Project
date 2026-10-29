import React from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'lime' | 'ghost' | 'outline'
export function Button({ children, variant='primary', loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed'
  const styles: Record<Variant,string> = {
    primary: 'bg-cobalt text-white px-6 py-3 border-2 border-ink shadow-offset hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
    lime: 'bg-lime text-ink px-6 py-3 border-2 border-ink shadow-offset hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
    ghost: 'bg-transparent text-ink px-6 py-3 border-2 border-ink hover:bg-ink hover:text-ivory',
    outline: 'bg-white text-ink px-6 py-3 border-2 border-ink hover:bg-ivory',
  }
  return (
    <button className={`${base} ${styles[variant]}`} {...props} disabled={loading || props.disabled}>
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  )
}
export default Button
