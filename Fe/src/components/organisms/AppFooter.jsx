import { Layout } from 'antd'

const { Footer } = Layout

export default function AppFooter() {
  return (
    <Footer className="!mt-auto !bg-[#1a1a1a] !py-5 !text-center !text-[#f9f9f6]">
      <div className="text-[15px] leading-6">
        © 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.
      </div>
      <div className="mt-1.5 text-xs leading-5 text-[#d9d9d2] font-[var(--font-jp)]">
        さくらレストラン - AR/VRで日本料理を体験
      </div>
    </Footer>
  )
}
