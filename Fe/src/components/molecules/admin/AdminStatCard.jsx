import { Card } from 'antd'

export default function AdminStatCard({ title, value, note, accent = false }) {
  return (
    <Card className={accent ? 'admin-stat-card admin-stat-card--accent' : 'admin-stat-card'}>
      <div className="admin-stat-card__title">{title}</div>
      <div className="admin-stat-card__value">{value}</div>
      {note ? <div className="admin-stat-card__note">{note}</div> : null}
    </Card>
  )
}
