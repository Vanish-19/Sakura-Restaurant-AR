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
  { key: 'all', label: 'All Floors' },
  { key: 'vip', label: 'VIP Lounge' },
  { key: 'terrace', label: 'Terrace' },
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

export default function TableSelectionModal({ open, onCancel, onConfirm }) {
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
      title={<div className="text-2xl font-bold">Select Table</div>}
      onCancel={() => {}}
      onOk={() => selected && onConfirm(selected)}
      okText="Confirm Selection"
      cancelText="Back"
      okButtonProps={{ disabled: !selected, className: '!bg-[#c0001c] hover:!bg-[#d1142f] !border-0' }}
      cancelButtonProps={{ className: '!border-[#d6d6d6] hover:!border-[#c0001c] hover:!text-[#c0001c]' }}
      width={860}
      centered
      closable={false}
      maskClosable={false}
      keyboard={false}
      afterClose={() => {
        setSelected(null)
        setQuery('')
        setActiveFloor('all')
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className="flex items-center justify-between">
          <div className="text-left text-xs text-slate-500">
            Selected table:{' '}
            <span className="font-semibold text-[#c0001c]">{selected ? `Table ${selected}` : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CancelBtn />
            <OkBtn />
          </div>
        </div>
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-slate-300 bg-white" /> Available
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#8b0000]" /> Occupied
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#efefef]" /> Reserved
          </span>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find table number"
          className="max-w-xs"
        />
      </div>

      <div className="mb-4 flex items-center justify-end gap-2">
        {floorFilters.map((filter) => {
          const active = activeFloor === filter.key
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFloor(filter.key)}
              className={
                'rounded-md px-3 py-1.5 text-xs font-semibold transition ' +
                (active
                  ? 'bg-[#c0001c] text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#c0001c]')
              }
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className="grid max-h-[52vh] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-7 md:grid-cols-10">
        {tables.map((table) => {
          const isActive = table.tableNo === selected

          let stateClass = 'border-slate-200 bg-white text-slate-800 hover:border-[#c0001c] hover:text-[#c0001c]'
          if (table.status === 'reserved') {
            stateClass = 'cursor-not-allowed border-[#e5e5e5] bg-[#efefef] text-slate-400'
          } else if (table.status === 'occupied') {
            stateClass = 'cursor-not-allowed border-[#8b0000] bg-[#8b0000] text-white'
          } else if (isActive) {
            stateClass = 'border-[#c0001c] bg-[#c0001c] text-white'
          }

          return (
            <button
              key={table.tableNo}
              type="button"
              disabled={table.disabled}
              onClick={() => setSelected(table.tableNo)}
              className={
                'h-12 rounded-lg border text-sm font-semibold transition ' +
                stateClass
              }
            >
              {table.tableNo}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
