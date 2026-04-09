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
                  '!h-10 !rounded-full !border-0 !px-6 !font-semibold !transition-all !duration-200 hover:!-translate-y-0.5 active:!translate-y-0 ' +
                  (isActive
                    ? '!bg-gradient-to-r !from-red-600 !to-red-700 !text-white hover:!from-red-500 hover:!to-red-600 hover:!shadow-md'
                    : '!text-slate-900 hover:!bg-white hover:!text-red-700')
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
