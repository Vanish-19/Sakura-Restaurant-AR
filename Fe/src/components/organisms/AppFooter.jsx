import { Layout } from 'antd'

const { Footer } = Layout

export default function AppFooter() {
  return (
    <Footer className="!bg-[#1a1a1a] !py-10 !text-center !text-[#f9f9f6]">
      <div className="text-base">
        © 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.
      </div>
      <div className="mt-3 text-sm text-[#d9d9d2] font-[var(--font-jp)]">
        さくらレストラン - AR/VRで日本料理を体験
      </div>
    </Footer>
  )
}
