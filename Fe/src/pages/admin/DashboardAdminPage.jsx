import {
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'

const stats = [
  { key: 'revenue', title: 'Total Revenue', value: '$14,280.00', delta: '+12.5%', icon: <WalletOutlined />, tone: 'red' },
  { key: 'orders', title: 'Total Orders', value: '342', delta: '+5.2%', icon: <FireOutlined />, tone: 'dark' },
  { key: 'newCustomers', title: 'New Customers', value: '28', delta: '-18%', icon: <TeamOutlined />, tone: 'slate' },
  { key: 'topDish', title: 'Top Selling Dish', value: 'Black Truffle Ramen', delta: '112 Sold Today', icon: <TrophyOutlined />, tone: 'ruby' },
]

const rows = [
  { id: '#SK-9821', customer: 'Elena Arisawa', items: '2x Wagyu Gyoza, 1x Sake', time: '10:42 AM', amount: '$124.50', status: 'Pending' },
  { id: '#SK-9819', customer: 'Kenji Watanabe', items: "1x Chef's Selection Omakase", time: '10:15 AM', amount: '$210.00', status: 'Completed' },
  { id: '#SK-9818', customer: 'Yumi Tanaka', items: '3x Spicy Miso Ramen', time: '09:55 AM', amount: '$58.00', status: 'Canceled' },
]

function statusClassName(status) {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Pending') return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

function toneClassName(tone) {
  if (tone === 'red') return 'border-l-[#cf0f23]'
  if (tone === 'dark') return 'border-l-[#111111]'
  if (tone === 'ruby') return 'border-l-[#8b1f2a]'
  return 'border-l-[#5e6168]'
}

export default function DashboardAdminPage() {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#171717]">Daily Summary</h1>
          <p className="mt-1.5 text-sm text-[#6d6f75]">Monday, 23 Oct 2023 - Kitchen Pulse</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#c70f21] px-5 text-[12px] font-semibold uppercase tracking-[0.05em] text-white shadow-[0_10px_22px_rgba(199,15,33,0.25)] transition hover:bg-[#d2162a]"
          type="button"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Export Report
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.key}
            className={[
              'rounded-xl border border-[#e8e8ea] bg-[#fcfcfd] p-4 shadow-[0_2px_8px_rgba(16,24,40,0.03)]',
              'border-l-[2px]',
              toneClassName(stat.tone),
            ].join(' ')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-[#f0f1f3] text-[#44474d]">{stat.icon}</div>
              <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50">{stat.delta}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b8e95]">{stat.title}</p>
            <p className="mt-2 text-[29px] font-semibold leading-tight text-[#151618]">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-2xl border border-[#ebebed] bg-[#fcfcfd] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight text-[#191a1b]">Revenue Performance</h2>
              <p className="text-sm text-[#8a8d95]">Monthly sales distribution and growth</p>
            </div>
            <div className="inline-flex overflow-hidden rounded-md border border-[#e6e6e8] text-[11px]">
              <button type="button" className="bg-white px-3 py-1.5 text-[#65686f]">2023</button>
              <button type="button" className="bg-[#fff1f2] px-3 py-1.5 font-semibold text-[#be1325]">Monthly</button>
            </div>
          </div>

          <div className="relative h-[250px] rounded-xl bg-[#fafafb] p-4">
            <div className="absolute inset-x-4 bottom-10 h-px bg-[#ececee]" />
            <div className="absolute inset-x-4 bottom-20 h-px bg-[#f0f1f3]" />
            <div className="absolute inset-x-4 bottom-32 h-px bg-[#f0f1f3]" />

            <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] uppercase tracking-[0.07em] text-[#a1a4aa]">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>
        </article>

        <aside className="rounded-2xl bg-gradient-to-b from-[#111111] to-[#2e1015] p-5 text-white shadow-[0_14px_28px_rgba(17,17,17,0.32)]">
          <h3 className="text-[28px] font-semibold leading-tight">Peak Performance</h3>
          <p className="mt-1 text-xs text-white/60">Optimal operational windows</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-[0.11em] text-white/65">Busiest Hour</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <ClockCircleOutlined className="text-[#ef4457]" />
                19:30 - 21:00
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-[0.11em] text-white/65">Wait Time Avg</p>
              <p className="mt-2 text-lg font-semibold">14 Minutes</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-r from-[#4c090f] to-[#740f1b] p-3.5 ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/65">Live Staffing</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1f1f1f] text-[11px]">AK</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1f1f1f] text-[11px]">MT</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1f1f1f] text-[11px]">HS</span>
              <span className="rounded-full bg-[#1f1f1f] px-2 py-1 text-[11px]">+5</span>
            </div>
          </div>
        </aside>
      </div>

      <article className="rounded-2xl border border-[#e9e9eb] bg-[#fcfcfd] shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#efeff1] px-5 py-4">
          <div>
            <h3 className="text-[28px] font-semibold leading-tight text-[#191a1b]">Recent Orders</h3>
            <p className="text-sm text-[#8a8d95]">Real-time order tracking and status</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#cc1023]" type="button">View All Orders</button>
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#c70f21] text-white shadow-[0_10px_22px_rgba(199,15,33,0.28)]" type="button" aria-label="add order">
              <PlusOutlined />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[#9699a2]">
                <th className="px-5 py-3">Order Id</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#efeff1] text-sm text-[#2a2b30]">
                  <td className="px-5 py-4 font-semibold">{row.id}</td>
                  <td className="px-5 py-4">{row.customer}</td>
                  <td className="px-5 py-4 text-[#656870]">{row.items}</td>
                  <td className="px-5 py-4 text-[#656870]">{row.time}</td>
                  <td className="px-5 py-4 font-semibold">{row.amount}</td>
                  <td className="px-5 py-4">
                    <span className={["rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]", statusClassName(row.status)].join(' ')}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>

  )
}
