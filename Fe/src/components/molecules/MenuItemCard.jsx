import { ScanOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Button, Card, Tooltip } from 'antd'
import ArExperienceBadge from '../atoms/ArExperienceBadge.jsx'
import TagBadge from '../atoms/TagBadge.jsx'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export default function MenuItemCard({
  item,
  categoryLabel,
  onAdd,
  onViewAr,
}) {
  const handleAdd = onAdd ?? (() => { })
  const handleViewAr = onViewAr ?? (() => { })
  const canViewAr = Boolean(item?.arModels?.glb_url || item?.arModels?.usdz_url)
  const isBestSeller = Boolean(item?.isBestSeller)
  const shouldShowArAction = isBestSeller
  const descriptionTooltip = (item?.description || '').trim()

  return (
    <div className="relative">
      {item?.isBestSeller ? (
        <span className="absolute -top-5 left-3 z-30 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#4a2900] shadow-[0_8px_16px_rgba(217,119,6,0.28)] ring-1 ring-amber-200">
          Best Seller
        </span>
      ) : null}

      <Card
        hoverable
        className="menu-item-card h-full overflow-hidden !rounded-2xl !border-0 !bg-transparent !shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        style={{ display: 'flex', flexDirection: 'column' }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'transparent',
          },
        }}
        cover={
          <div className="menu-item-card__cover relative">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="menu-item-card__image w-full object-cover"
              loading="lazy"
            />
            <TagBadge>{categoryLabel}</TagBadge>
            {canViewAr ? <ArExperienceBadge /> : null}
          </div>
        }
      >
        <div className="menu-item-card__title text-xl font-semibold text-slate-900 font-[var(--font-heading)]">
          {item.name}
        </div>

        <div className="menu-item-card__price text-xl font-extrabold text-red-600">
          {currency.format(item.price)}
        </div>

        <Tooltip
          title={
            descriptionTooltip ? (
              <div className="menu-item-card__tooltip-content">
                <div className="menu-item-card__tooltip-title">Mô tả món</div>
                <div>{descriptionTooltip}</div>
              </div>
            ) : null
          }
          placement="topLeft"
          mouseEnterDelay={0.2}
          overlayClassName="menu-item-card__tooltip"
        >
          <div className="menu-item-card__desc text-slate-600">{item.description}</div>
        </Tooltip>

        {item.jpName ? (
          <div className="menu-item-card__jp text-sm text-slate-500 font-[var(--font-jp)]">
            {item.jpName}
          </div>
        ) : null}

        <div className={`menu-item-card__actions mt-auto flex items-center gap-3 pt-4 ${shouldShowArAction ? 'justify-between' : 'justify-end'}`}>
          {shouldShowArAction ? (
            <Tooltip
              title={canViewAr ? null : 'Món này chưa có model AR/VR'}
              placement="top"
              mouseEnterDelay={0.15}
            >
              <Button
                className="!h-9 !rounded-full !border-red-200 !bg-white/90 !px-4 !text-slate-900 !transition-all !duration-200 hover:!-translate-y-0.5 hover:!border-red-400 hover:!bg-red-50 hover:!text-red-700 hover:!shadow-sm active:!translate-y-0 disabled:!cursor-not-allowed disabled:!opacity-60"
                icon={<ScanOutlined />}
                shape="round"
                disabled={!canViewAr}
                onClick={() => handleViewAr(item)}
              >
                View AR/VR
              </Button>
            </Tooltip>
          ) : null}
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
