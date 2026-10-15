import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

type OtpInputProps = {
  /** Digits entered so far (contiguous, 0..length chars). */
  value: string
  onChange: (value: string) => void
  /** Fired from user input once every box is filled. */
  onComplete?: (code: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  /** Bump to shake the boxes and refocus the first one (e.g. after a wrong code). */
  errorKey?: number
  autoFocus?: boolean
  label?: string
  describedBy?: string
}

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-9px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(0)' },
]

/** Six single-digit boxes: auto-advance, backspace, arrows, paste / SMS autofill of the full code. */
export function OtpInput({
  value, onChange, onComplete, length = 6, disabled, invalid, errorKey = 0, autoFocus, label = 'Verification code', describedBy,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const group = useRef<HTMLDivElement>(null)
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  const focusBox = (index: number) => {
    const box = inputs.current[Math.max(0, Math.min(length - 1, index))]
    box?.focus()
    box?.select()
  }

  useEffect(() => {
    if (!errorKey) return
    group.current?.animate(SHAKE, { duration: 420, easing: 'ease-in-out' })
    inputs.current[0]?.focus()
  }, [errorKey])

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
    return clean
  }

  const handleInput = (index: number, raw: string, previous: string) => {
    // A filled box receiving one more key holds two chars: keep only the new one.
    const fresh = previous && raw.length === 2 ? (raw.startsWith(previous) ? raw.slice(1) : raw.slice(0, 1)) : raw
    const typed = fresh.replace(/\D/g, '')
    if (!typed) return
    if (typed.length > 1) {
      // Autofill or a multi-char paste landed in one box: fill from here.
      const clean = commit(value.slice(0, index) + typed)
      focusBox(clean.length)
      return
    }
    const position = Math.min(index, value.length)
    commit(value.slice(0, position) + typed + value.slice(position + 1))
    focusBox(position + 1)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1))
        focusBox(index)
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index))
        focusBox(index - 1)
      }
    } else if (event.key === 'Delete') {
      event.preventDefault()
      onChange(value.slice(0, index) + value.slice(index + 1))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(Math.min(index + 1, value.length))
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusBox(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusBox(value.length)
    }
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    event.preventDefault()
    if (!pasted) return
    const start = pasted.length >= length ? 0 : Math.min(index, value.length)
    const clean = commit(value.slice(0, start) + pasted)
    focusBox(clean.length)
  }

  return (
    <div ref={group} role="group" aria-label={label} aria-describedby={describedBy} className="flex justify-center gap-2 sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleInput(index, event.target.value, digit)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          onClick={() => {
            // Keep the code contiguous: a click past the end lands on the first empty box.
            if (index > value.length) focusBox(value.length)
          }}
          className={`otp-box h-14 w-11 rounded-2xl border bg-white/90 text-center font-display text-[28px] font-bold text-[#173f32] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-200 sm:h-16 sm:w-13 sm:text-[32px] dark:bg-stone-900/80 dark:text-amber-100 ${
            invalid
              ? 'border-rose-400 bg-rose-50/60 dark:border-rose-500/70 dark:bg-rose-950/30'
              : digit
                ? 'border-[#173f32]/40 dark:border-amber-200/40'
                : 'border-stone-200 dark:border-stone-700'
          } focus:-translate-y-0.5 focus:border-[#D9B27C] focus:ring-4 focus:ring-[#D9B27C]/25 disabled:opacity-60`}
        />
      ))}
    </div>
  )
}
