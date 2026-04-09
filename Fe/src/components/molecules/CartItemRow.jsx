import { DeleteOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function CartItemRow({
  item,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-28 w-36 flex-none rounded-2xl object-cover"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xl font-bold text-slate-900">
                {item.name}
              </div>
              {item.jpName ? (
                <div className="mt-1 truncate text-sm text-slate-500">{item.jpName}</div>
              ) : null}
              <div className="mt-3 text-slate-600">{item.description}</div>
            </div>

            <Button
              type="text"
              aria-label="Xóa món"
              icon={<DeleteOutlined />}
              className="!h-9 !w-9 !min-w-9 !rounded-lg !p-0 !text-red-500 hover:!bg-red-50 hover:!text-red-600"
              onClick={onRemove}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Button
                className="!h-10 !w-10 !min-w-10 !rounded-xl !border-[#d9d9d9] !bg-white !p-0 !text-lg !font-semibold !text-slate-700 hover:!border-red-300 hover:!text-red-600"
                onClick={onDecrease}
              >
                -
              </Button>
              <div className="w-5 text-center text-2xl font-semibold text-slate-900">
                {quantity}
              </div>
              <Button
                className="!h-10 !w-10 !min-w-10 !rounded-xl !border-[#d9d9d9] !bg-white !p-0 !text-lg !font-semibold !text-slate-700 hover:!border-red-300 hover:!text-red-600"
                onClick={onIncrease}
              >
                +
              </Button>
            </div>

            <div className="text-xl font-extrabold text-red-600">
              {currency.format(item.price * quantity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
