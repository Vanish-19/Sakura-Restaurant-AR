import { RestOutlined } from '@ant-design/icons'

export default function Brand({ className = '' }) {
  return (
    <div className={['flex items-center gap-3', className].join(' ')}>
      <RestOutlined className="text-2xl -rotate-12" />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-wide font-[var(--font-heading)]">
          Sakura Restaurant
        </div>
        <div className="text-xs opacity-90 font-[var(--font-jp)]">
          さくらレストラン
        </div>
      </div>
    </div>
  )
}
