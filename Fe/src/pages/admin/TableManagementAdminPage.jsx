import { BellFilled, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Badge, Button, Card, Input, Tag, message, Spin } from 'antd'
import { useMemo, useState, useEffect } from 'react'
import { getAllTables } from '../../services/adminTableApi.js'

const floorOptions = [
  { label: 'All Floors', value: 'all' },
  { label: 'Main Hall', value: 'main hall' },
  { label: 'VIP Lounge', value: 'vip lounge' },
  { label: 'Terrace', value: 'terrace' },
]

// Tables data is now fetched from backend

const arrivals = [
  { id: 1, time: 'IN 15 MINS', name: 'Mr. Saturo Gojo', guests: '6 Guests', table: 'Table 03 · VIP', at: '19:30', highlight: true },
  { id: 2, time: 'IN 45 MINS', name: 'Yuki Tsukumo', guests: '2 Guests', table: 'Table 09 · Terrace', at: '20:00', highlight: false },
]

function tableStateStyle(state) {
  if (state === 'occupied') return 'border-rose-600 text-rose-700 bg-white'
  if (state === 'reserved') return 'border-amber-500 text-amber-600 bg-white'
  return 'border-zinc-200 text-zinc-400 bg-zinc-100/80'
}

export default function TableManagementAdminPage() {
  const [activeFloor, setActiveFloor] = useState('all')
  const [query, setQuery] = useState('')
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTables = async () => {
    try {
      setLoading(true)
      const res = await getAllTables()
      if (res?.success && Array.isArray(res.data)) {
        const mapped = res.data.map(t => {
          let state = 'available'
          let note = `CAP ${t.capacity}`
          if (t.status === 'dining') { state = 'occupied'; note = 'IN SERVICE' }
          if (t.status === 'reserved') { state = 'reserved'; note = 'RESERVED' }

          return {
            id: t._id,
            code: t.name.replace('T', ''),
            zone: t.zone || 'Main Hall',
            state,
            note
          }
        })
        setTables(mapped)
      }
    } catch (err) {
      console.error(err)
      message.error('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const visibleSlots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tables.filter((slot) => {
      const passFloor = activeFloor === 'all' || slot.zone.toLowerCase() === activeFloor
      const passQuery =
        normalizedQuery.length === 0 ||
        slot.code.toLowerCase().includes(normalizedQuery) ||
        slot.zone.toLowerCase().includes(normalizedQuery)

      return passFloor && passQuery
    })
  }, [activeFloor, query, tables])

  const availableCount = tables.filter((slot) => slot.state === 'available').length
  const reservedCount = tables.filter((slot) => slot.state === 'reserved').length
  const occupiedCount = tables.filter((slot) => slot.state === 'occupied').length

  return (
    <div className="space-y-4 pb-20">
      <section className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-3">
        <div className="flex items-start gap-5">
          <h1 className="text-[46px] leading-[0.92] font-black tracking-[-0.03em] text-zinc-900">
            TABLE
            <br />
            MANAGEMENT
          </h1>

          <div className="mt-1 hidden h-12 w-px bg-zinc-200 xl:block" />

          <div className="hidden gap-5 xl:flex">
            {floorOptions.map((option) => {
              const active = activeFloor === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFloor(option.value)}
                  className={[
                    'pb-1 text-sm font-medium transition',
                    active
                      ? 'border-b-2 border-rose-600 text-rose-600'
                      : 'text-zinc-400 hover:text-zinc-700',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search table..."
            prefix={<SearchOutlined className="text-zinc-400" />}
            className="w-[210px] !rounded-lg !border-zinc-200 !bg-zinc-100"
          />
          <button className="grid h-9 w-9 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="notifications">
            <BellFilled className="text-[13px]" />
          </button>
        </div>
      </section>

      <section className="flex gap-3 overflow-x-auto xl:hidden">
        {floorOptions.map((option) => {
          const active = activeFloor === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFloor(option.value)}
              className={[
                'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                active
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-zinc-300 bg-white text-zinc-600',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="!rounded-xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 18 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">CURRENT OCCUPANCY</div>
          <div className="mt-2 text-[48px] leading-none font-black tracking-tight text-zinc-900">42/100</div>
          <div className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <TeamOutlined className="text-lg" />
          </div>
        </Card>

        <Card className="!rounded-xl !border !border-emerald-200 !shadow-none" bodyStyle={{ padding: 18 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">AVAILABLE</div>
          <div className="mt-2 text-[42px] leading-none font-black tracking-tight text-emerald-600">{availableCount}</div>
          <Tag className="!mt-2 !rounded-md !border-emerald-100 !bg-emerald-50 !text-[10px] !font-semibold !text-emerald-700">READY</Tag>
        </Card>

        <Card className="!rounded-xl !border !border-amber-300 !shadow-none" bodyStyle={{ padding: 18 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">RESERVED</div>
          <div className="mt-2 text-[42px] leading-none font-black tracking-tight text-amber-600">{reservedCount}</div>
        </Card>

        <Card className="!rounded-xl !border !border-rose-600 !shadow-none" bodyStyle={{ padding: 18 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">OCCUPIED</div>
          <div className="mt-2 text-[42px] leading-none font-black tracking-tight text-rose-700">{occupiedCount}</div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
        <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none 2xl:col-span-9" bodyStyle={{ padding: 0 }}>
          <div className="border-b border-zinc-100 px-5 py-4">
            <h3 className="m-0 text-[42px] leading-none font-black tracking-tight text-zinc-900">Main Hall Overview</h3>
            <p className="mt-1 mb-0 text-xs text-zinc-500">Section A · Ground Floor</p>
          </div>

          <div className="min-h-[400px] bg-[radial-gradient(#efefef_1px,transparent_1px)] bg-[size:16px_16px] p-5">
            {loading ? (
              <div className="flex justify-center py-20"><Spin /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {visibleSlots.map((slot) => (
                  <div key={slot.id} className="space-y-2">
                    <div className={`relative flex h-[74px] items-center justify-center rounded-xl border-2 text-center ${tableStateStyle(slot.state)}`}>
                      <div>
                        <div className="text-[34px] leading-none font-black tracking-tight">{slot.code}</div>
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{slot.note}</div>
                      </div>

                      {slot.state === 'occupied' ? (
                        <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">OCC</span>
                      ) : null}

                      {slot.state === 'reserved' ? (
                        <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">R</span>
                      ) : null}
                    </div>
                    <div className="text-center text-[10px] uppercase tracking-[0.12em] text-zinc-400">{slot.zone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-zinc-100 px-5 py-4 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded bg-zinc-200" /> Available</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded bg-rose-600" /> Occupied</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded bg-amber-500" /> Reserved</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded bg-zinc-900" /> Needs Cleaning</span>
          </div>
        </Card>

        <div className="space-y-4 2xl:col-span-3">
          <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 18 }}>
            <h4 className="m-0 text-[34px] leading-none font-black tracking-tight text-zinc-900">Upcoming Arrivals</h4>
            <div className="mt-4 space-y-3">
              {arrivals.map((item) => (
                <div key={item.id} className={`rounded-xl border p-3 ${item.highlight ? 'border-amber-300 bg-amber-50/50' : 'border-zinc-200 bg-zinc-50'}`}>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <span>{item.time}</span>
                    <span>{item.at}</span>
                  </div>
                  <p className="mt-2 mb-0 text-[24px] leading-none font-black tracking-tight text-zinc-900">{item.name}</p>
                  <p className="mt-1 mb-0 text-xs text-zinc-500">{item.guests} · {item.table}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 18 }}>
            <h4 className="m-0 text-[34px] leading-none font-black tracking-tight text-zinc-900">Floor Heatmap</h4>
            <div className="mt-3 rounded-xl bg-gradient-to-b from-rose-100 to-zinc-200 p-4">
              <div className="grid grid-cols-6 gap-1 opacity-80">
                {Array.from({ length: 42 }).map((_, idx) => (
                  <div key={idx} className={`h-5 rounded ${idx % 5 === 0 ? 'bg-zinc-300' : idx % 3 === 0 ? 'bg-rose-200' : 'bg-zinc-100'}`} />
                ))}
              </div>
              <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                <Badge color="#111827" text="Main Hall Peak" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-3">
        <Button
          type="text"
          icon={<PlusOutlined />}
          className="!h-11 !w-11 !rounded-xl !border-0 !bg-zinc-900 !text-white hover:!bg-zinc-800"
        />
        <Button
          type="text"
          icon={<PlusOutlined />}
          className="!h-11 !w-11 !rounded-xl !border-0 !bg-rose-600 !text-white hover:!bg-rose-500"
        />
      </div>
    </div>
  )
}
