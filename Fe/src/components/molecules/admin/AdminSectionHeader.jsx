export default function AdminSectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="admin-section-header">
      <div>
        {eyebrow ? <div className="admin-section-header__eyebrow">{eyebrow}</div> : null}
        <h1 className="admin-section-header__title">{title}</h1>
        {subtitle ? <p className="admin-section-header__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
