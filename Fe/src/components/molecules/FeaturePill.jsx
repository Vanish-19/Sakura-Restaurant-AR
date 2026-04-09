export default function FeaturePill({
  icon,
  text,
  onClick,
  isActive = false,
  variant = 'dark',
}) {
  const Component = onClick ? 'button' : 'div'

  const variantClassName =
    variant === 'light'
      ? 'bg-white/80 text-slate-900 ring-1 ring-red-100'
      : 'bg-white/15 text-white'

  const hoverClassName = onClick
    ? variant === 'light'
      ? 'cursor-pointer border-0 outline-none transition-all duration-200 hover:bg-white hover:ring-red-200 hover:shadow-md'
      : 'cursor-pointer border-0 outline-none transition-all duration-200 hover:bg-white/25 hover:shadow-md'
    : ''

  const activeClassName =
    isActive && variant === 'light'
      ? ' ring-2 ring-red-300/60'
      : isActive
        ? ' ring-2 ring-white/50'
        : ''

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={
        'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold backdrop-blur ' +
        variantClassName +
        ' ' +
        hoverClassName +
        ' active:translate-y-0' +
        activeClassName
      }
    >
      <span className="text-base">{icon}</span>
      <span>{text}</span>
    </Component>
  )
}
