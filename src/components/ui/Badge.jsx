import clsx from 'clsx'

const variants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', variants[variant], className)}>
      {children}
    </span>
  )
}
