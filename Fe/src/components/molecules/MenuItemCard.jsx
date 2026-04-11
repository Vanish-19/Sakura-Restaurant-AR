import { ScanOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import ArExperienceBadge from '../atoms/ArExperienceBadge.jsx'
import TagBadge from '../atoms/TagBadge.jsx'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function MenuItemCard({
  item,
  categoryLabel,
  onAdd,
  onViewAr,
}) {
  const handleAdd = onAdd ?? (() => { })
  const handleViewAr = onViewAr ?? (() => { })
  const canViewAr = Boolean(item?.isBestSeller)

  return (
    <div className="relative">
      {item?.isBestSeller ? (
        <span className="absolute -top-5 left-3 z-30 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#4a2900] shadow-[0_8px_16px_rgba(217,119,6,0.28)] ring-1 ring-amber-200">
          Best Seller
        </span>
      ) : null}

      <Card
        hoverable
        className="h-full overflow-hidden !rounded-2xl !border-0 !bg-transparent !shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        style={{ display: 'flex', flexDirection: 'column' }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'transparent',
          },
        }}
        cover={
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
            <TagBadge>{categoryLabel}</TagBadge>
            {canViewAr ? <ArExperienceBadge /> : null}
          </div>
        }
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-xl font-semibold text-slate-900 font-[var(--font-heading)]">
            {item.name}
          </div>
          <div className="text-xl font-extrabold text-red-600">
            {currency.format(item.price)}
          </div>
        </div>

        {item.jpName ? (
          <div className="text-sm text-slate-500 font-[var(--font-jp)]">
            {item.jpName}
          </div>
        ) : null}

        <div className="text-slate-600">{item.description}</div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Button
            className="!h-9 !rounded-full !border-red-200 !bg-white/90 !px-4 !text-slate-900 !transition-all !duration-200 hover:!-translate-y-0.5 hover:!border-red-400 hover:!bg-red-50 hover:!text-red-700 hover:!shadow-sm active:!translate-y-0"
            icon={<ScanOutlined />}
            shape="round"
            disabled={!canViewAr}
            onClick={() => handleViewAr(item)}
          >
            View AR/VR
          </Button>
          <Button
            className="!h-10 !w-10 !min-w-10 !rounded-full !border-0 !bg-gradient-to-br !from-red-500 !to-red-600 !p-0 !text-white !opacity-100 !transition-all !duration-200 hover:!-translate-y-0.5 hover:!from-red-400 hover:!to-red-500 hover:!shadow-[0_10px_20px_rgba(220,38,38,0.32)] active:!translate-y-0"
            type="primary"
            icon={<ShoppingCartOutlined />}
            shape="round"
            onClick={() => handleAdd(item)}
          />
        </div>
      </Card>
    </div>
  )
}
