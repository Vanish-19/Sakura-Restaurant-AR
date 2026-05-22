import { DeleteOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export default function CartItemRow({
  item,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:p-5">
      <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 sm:flex sm:gap-4">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-24 w-24 flex-none rounded-xl object-cover sm:h-28 sm:w-36 sm:rounded-2xl"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 sm:truncate sm:text-xl sm:leading-normal">
                {item.name}
              </div>
              {item.jpName ? (
                <div className="mt-1 hidden truncate text-sm text-slate-500 sm:block">{item.jpName}</div>
              ) : null}
              <div className="mt-3 hidden text-slate-600 sm:block">{item.description}</div>
            </div>

            <Button
              type="text"
              aria-label="Xóa món"
              icon={<DeleteOutlined />}
              className="!h-8 !w-8 !min-w-8 !shrink-0 !rounded-lg !p-0 !text-red-500 hover:!bg-red-50 hover:!text-red-600 sm:!h-9 sm:!w-9 sm:!min-w-9"
              onClick={onRemove}
            />
          </div>

          <div className="mt-3 flex flex-col items-start gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-base font-extrabold text-red-600 sm:order-2 sm:text-xl">
              {currency.format(item.price * quantity)}
            </div>

            <div className="flex items-center gap-2 sm:order-1 sm:gap-4">
              <Button
                className="!h-8 !w-8 !min-w-8 !rounded-lg !border-[#d9d9d9] !bg-white !p-0 !text-base !font-semibold !text-slate-700 hover:!border-red-300 hover:!text-red-600 sm:!h-10 sm:!w-10 sm:!min-w-10 sm:!rounded-xl sm:!text-lg"
                onClick={onDecrease}
              >
                -
              </Button>
              <div className="w-5 text-center text-lg font-semibold text-slate-900 sm:text-2xl">
                {quantity}
              </div>
              <Button
                className="!h-8 !w-8 !min-w-8 !rounded-lg !border-[#d9d9d9] !bg-white !p-0 !text-base !font-semibold !text-slate-700 hover:!border-red-300 hover:!text-red-600 sm:!h-10 sm:!w-10 sm:!min-w-10 sm:!rounded-xl sm:!text-lg"
                onClick={onIncrease}
              >
                +
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
