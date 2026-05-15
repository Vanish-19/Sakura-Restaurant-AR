import { Button } from 'antd'

export default function CategoryBar({ categories, activeKey, onChange }) {
  return (
    <div className="sticky top-16 z-40 border-b border-red-100/60 bg-gradient-to-b from-white/90 to-rose-50/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-5 md:px-8">
        <div className="flex items-center gap-2 overflow-x-auto rounded-full bg-white/80 p-2 ring-1 ring-red-100">
          {categories.map((category) => {
            const isActive = category.key === activeKey

            return (
              <Button
                key={category.key}
                type="text"
                className={
                  '!h-10 !rounded-full !border !px-6 !font-semibold !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 active:!translate-y-0 ' +
                  (isActive
                    ? '!border-[#8B0000] !bg-[#8B0000] !text-white !shadow-[0_10px_22px_rgba(139,0,0,0.22)] hover:!bg-[#700000] hover:!shadow-[0_14px_28px_rgba(139,0,0,0.28)]'
                    : '!border-transparent !bg-transparent !text-[#4A4A4A] hover:!border-[#c6001e] hover:!bg-[#fff1f3] hover:!text-[#900020] hover:!shadow-[0_10px_22px_rgba(144,0,32,0.10)]')
                }
                onClick={() => onChange(category.key)}
              >
                {category.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
