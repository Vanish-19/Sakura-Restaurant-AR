import { ScanOutlined } from '@ant-design/icons'

export default function ArExperienceBadge() {
  return (
    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 backdrop-blur">
      <ScanOutlined />
      AR Experience
    </span>
  )
}
