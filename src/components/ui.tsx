import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  type ReactNode,
  TextareaHTMLAttributes,
} from 'react'

const baseBtn =
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-950'

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<BtnVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800',
  danger:
    'border border-red-300 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40',
}

export function Btn({
  variant = 'secondary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button type="button" className={`${baseBtn} ${variants[variant]} ${className}`} {...rest} />
}

/** 分段切换（如「编码/解码」）：选中段白底 + 投影 */
export function Segmented({
  options,
  value,
  onChange,
  className = '',
}: {
  options: { value: string; label: ReactNode }[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`min-h-[40px] flex-1 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-slate-950 ${
              active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Card({
  title,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
          {action}
        </header>
      )}
      <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
      {children}
    </span>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      className={`min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 ${className}`}
      {...rest}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 ${className}`}
      {...rest}
    />
  )
}

export function CheckBox({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-indigo-600"
      />
      {children}
    </label>
  )
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'error' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
