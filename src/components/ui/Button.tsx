import { Link, type LinkProps } from 'react-router'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-3 px-7 h-12 whitespace-nowrap text-[0.8125rem] font-medium tracking-[0.18em] uppercase transition-[background-color,color,border-color,transform] duration-500 ease-[var(--ease-cinematic)] active:scale-[0.98] select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-brass text-ink hover:bg-[#d6b47c]',
  ghost: 'border border-line-strong text-paper hover:border-brass hover:text-brass',
}

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className)
}

export function ButtonLink({ variant = 'primary', className, ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...props} />
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={cn(base, variants[variant], className)} {...props} />
}
