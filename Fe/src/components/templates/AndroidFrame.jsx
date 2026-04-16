export default function AndroidFrame({ children }) {
  return (
    <div className="android-preview-bg min-h-screen px-3 py-6">
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-xl">
        <div className="h-[calc(100svh-3rem)] overflow-auto">{children}</div>
      </div>
    </div>
  )
}
