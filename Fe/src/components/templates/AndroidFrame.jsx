export default function AndroidFrame({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-rose-50 to-red-200 px-3 py-6">
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-xl">
        <div className="h-[calc(100svh-3rem)] overflow-auto">{children}</div>
      </div>
    </div>
  )
}
