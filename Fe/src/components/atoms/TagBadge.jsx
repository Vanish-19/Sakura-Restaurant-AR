export default function TagBadge({ children, className = '' }) {
  return (
    <span
      className={[
        'absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 text-xs font-semibold text-white shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
