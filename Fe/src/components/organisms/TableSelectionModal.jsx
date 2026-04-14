import { Input, Modal } from 'antd'
import { useMemo, useState } from 'react'

const reservedTables = new Set([
  '03',
  '08',
  '15',
  '17',
  '23',
  '35',
  '36',
  '43',
  '44',
  '49',
  '50',
  '54',
  '56',
  '57',
  '60',
  '66',
  '69',
])

const occupiedTables = new Set([
  '02',
  '06',
  '14',
  '20',
  '26',
  '29',
  '31',
  '33',
  '34',
  '40',
  '41',
  '42',
  '45',
  '46',
  '48',
  '52',
  '53',
  '55',
  '58',
  '59',
  '64',
  '65',
  '70',
])

const floorFilters = [
  { key: 'all', label: 'Tất cả khu vực' },
  { key: 'vip', label: 'Khu VIP' },
  { key: 'terrace', label: 'Sân thượng' },
]

function formatTableNo(value) {
  return String(value).padStart(2, '0')
}

function getZone(tableNo) {
  const n = Number(tableNo)
  if (n >= 41 && n <= 55) return 'vip'
  if (n >= 56) return 'terrace'
  return 'all'
}

export default function TableSelectionModal({ open, onCancel, onConfirm, forceSelection = false }) {
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [activeFloor, setActiveFloor] = useState('all')

  const tables = useMemo(() => {
    const list = Array.from({ length: 70 }, (_, idx) => {
      const tableNo = formatTableNo(idx + 1)

      let status = 'available'
      if (reservedTables.has(tableNo)) status = 'reserved'
      else if (occupiedTables.has(tableNo)) status = 'occupied'

      return {
        tableNo,
        zone: getZone(tableNo),
        status,
        disabled: status !== 'available',
      }
    })

    const filteredByFloor =
      activeFloor === 'all' ? list : list.filter((item) => item.zone === activeFloor)

    if (!query.trim()) return filteredByFloor
    return filteredByFloor.filter((item) => item.tableNo.includes(query.trim()))
  }, [activeFloor, query])

  return (
    <Modal
      open={open}
      title={
        <div>
          <div className="text-[38px] leading-none font-black tracking-tight text-zinc-900">Chọn bàn</div>
          <p className="mt-2 text-sm font-medium text-zinc-500">Vui lòng chọn bàn để bắt đầu phiên gọi món.</p>
        </div>
      }
      onCancel={() => {
        if (!forceSelection) onCancel?.()
      }}
      onOk={() => selected && onConfirm(selected)}
      okText="Xác nhận chọn bàn"
      cancelText="Quay lại"
      okButtonProps={{
        disabled: !selected,
        className:
          '!h-10 !rounded-lg !bg-[#cf001a] hover:!bg-[#e0001d] !border-0 !px-5 !font-semibold',
      }}
      cancelButtonProps={{ className: '!h-10 !rounded-lg !border-[#ddd] !px-5 hover:!border-[#c0001c] hover:!text-[#c0001c]' }}
      width={860}
      centered
      closable={!forceSelection}
      maskClosable={false}
      keyboard={!forceSelection}
      className="table-selection-modal"
      afterClose={() => {
        setSelected(null)
        setQuery('')
        setActiveFloor('all')
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className="mt-1 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div className="text-left text-xs uppercase tracking-wide text-zinc-400">
            Bàn đã chọn{' '}
            <span className="ml-1 text-base font-bold normal-case text-[#c0001c]">{selected ? `Bàn ${selected}` : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            {forceSelection ? null : <CancelBtn />}
            <OkBtn />
          </div>
        </div>
      )}
    >
      <div className="mb-3 rounded-xl border border-zinc-100 bg-white px-3 py-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-zinc-300 bg-white" /> Trống
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#cf001a]" /> Đang dùng
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#f3efef]" /> Đã đặt trước
            </span>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm số bàn..."
            className="max-w-xs !rounded-md !border-zinc-200"
          />
        </div>

        <div className="flex items-center justify-end gap-2 rounded-lg bg-[#fafafa] p-1">
          {floorFilters.map((filter) => {
            const active = activeFloor === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFloor(filter.key)}
                className={
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ' +
                  (active
                    ? 'bg-gradient-to-r from-[#b80016] to-[#df0020] text-white shadow-[0_6px_14px_rgba(184,0,22,0.28)]'
                    : 'bg-white text-zinc-500 ring-1 ring-zinc-200 hover:text-[#c0001c]')
                }
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid max-h-[52vh] grid-cols-5 gap-2 overflow-y-auto rounded-xl border border-zinc-100 bg-white p-2 pr-1 sm:grid-cols-7 md:grid-cols-10">
        {tables.map((table) => {
          const isActive = table.tableNo === selected

          let stateClass = 'border-zinc-200 bg-white text-zinc-800 hover:border-[#cf001a] hover:text-[#cf001a]'
          if (table.status === 'reserved') {
            stateClass = 'cursor-not-allowed border-[#efebeb] bg-[#f3efef] text-zinc-400'
          } else if (table.status === 'occupied') {
            stateClass = 'cursor-not-allowed border-[#cf001a] bg-[#cf001a] text-white'
          } else if (isActive) {
            stateClass = 'border-[#cf001a] bg-white text-[#cf001a] ring-1 ring-[#cf001a]'
          }

          return (
            <button
              key={table.tableNo}
              type="button"
              disabled={table.disabled}
              onClick={() => setSelected(table.tableNo)}
              className={'h-16 rounded-lg border text-lg font-semibold transition ' + stateClass}
            >
              {table.tableNo}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
