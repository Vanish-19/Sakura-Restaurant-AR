import { AppstoreOutlined, BellFilled, SearchOutlined, UserOutlined } from '@ant-design/icons'

export default function AdminTopbar() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
      <label className="relative w-full max-w-[300px] sm:max-w-[360px]">
        <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-400" />
        <input
          type="text"
          placeholder="Search orders, customers..."
          className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-100/70 pl-9 pr-3 text-[12px] text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
        />
      </label>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="notifications">
          <BellFilled className="text-[13px]" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" type="button" aria-label="apps">
          <AppstoreOutlined className="text-[13px]" />
        </button>

        <div className="h-8 w-px bg-zinc-200" />

        <div className="flex items-center gap-2 rounded-md bg-white px-2 py-1">
          <div className="text-right leading-tight">
            <p className="text-[11px] font-semibold text-zinc-900">Kenji Tanaka</p>
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-400">Floor Manager</p>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[#c10017] text-white">
            <UserOutlined className="text-[12px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
