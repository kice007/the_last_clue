import { cn } from '@/utils/cn'

interface WordmarkProps {
  size?: 'sm' | 'xl'
  className?: string
}

/** Logotype provisoire : THE LAST CLUE en capitales gravées, « LAST » souligné d'un filet laiton. */
export function Wordmark({ size = 'sm', className }: WordmarkProps) {
  if (size === 'sm') {
    return (
      <span className={cn('font-wordmark text-[0.8125rem] tracking-[0.32em] text-paper', className)}>
        THE <span className="text-brass">LAST</span> CLUE
      </span>
    )
  }
  return (
    <h1 className={cn('font-wordmark leading-[0.92] text-paper', className)}>
      <span className="block text-[clamp(1rem,1.6vw,1.375rem)] tracking-[0.6em] text-paper-muted">THE</span>
      <span className="relative mt-3 block text-[clamp(3.25rem,9vw,8.5rem)] tracking-[0.08em]">
        LAST CLUE
        <span aria-hidden className="absolute -bottom-3 left-1 h-px w-[38%] bg-gradient-to-r from-brass to-transparent" />
      </span>
    </h1>
  )
}
