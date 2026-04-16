import {
  DashboardOutlined,
  ForkOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Form, Input, Modal, Select, Tooltip } from 'antd'
import { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { key: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/food', label: 'Food Management', icon: <ForkOutlined /> },
  { key: '/admin/orders', label: 'Order Management', icon: <OrderedListOutlined /> },
  { key: '/admin/tables', label: 'Table Management', icon: <TableOutlined /> },
  { key: '/admin/users', label: 'User Management', icon: <TeamOutlined /> },
  { key: '/admin/admins', label: 'Admin Management', icon: <UserSwitchOutlined /> },
  { key: '/admin/content', label: 'Content Management', icon: <ReadOutlined /> },
]

export default function AdminSidebar({ adminSettings, onUpdateSettings }) {
  const location = useLocation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsForm] = Form.useForm()

  const selectedKeys = useMemo(() => {
    const exact = navItems.find((item) => location.pathname.startsWith(item.key))
    return exact ? [exact.key] : ['/admin/dashboard']
  }, [location.pathname])

  const openSettings = () => {
    settingsForm.setFieldsValue({
      websiteName: adminSettings?.websiteName || 'ZenithCrimson',
      clientWebsiteName: adminSettings?.clientWebsiteName || 'Sakura Restaurant',
      clientTagline: adminSettings?.clientTagline || 'Premium Japanese AR Dining',
      footerPrimary:
        adminSettings?.footerPrimary ||
        '© 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.',
      footerSecondary:
        adminSettings?.footerSecondary ||
        'さくらレストラン - AR/VRで日本料理を体験',
      themePreset: adminSettings?.themePreset || 'default',
      accentColor: adminSettings?.accentColor || '#c10017',
    })
    setIsSettingsOpen(true)
  }

  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields()
      onUpdateSettings?.({
        websiteName: values.websiteName,
        clientWebsiteName: values.clientWebsiteName,
        clientTagline: values.clientTagline,
        footerPrimary: values.footerPrimary,
        footerSecondary: values.footerSecondary,
        themePreset: values.themePreset,
        accentColor: values.accentColor,
      })
      setIsSettingsOpen(false)
    } catch {
      // form validation handles UI feedback
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] border-r border-zinc-200 bg-[#efefef] lg:flex lg:flex-col">
      <div className="px-5 pb-4 pt-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] text-white shadow-sm"
            style={{ backgroundColor: 'var(--admin-accent)' }}
          >
            <ForkOutlined className="text-[12px]" />
          </div>
          <div className="min-w-0 max-w-[150px]">
            <p className="truncate text-[13px] font-extrabold uppercase leading-none tracking-tight text-zinc-900">{adminSettings?.websiteName || 'ZenithCrimson'}</p>
            <p className="mt-1 truncate text-[9px] font-medium uppercase leading-none tracking-[0.16em] text-zinc-500">Premium Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-0">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const selected = selectedKeys.includes(item.key)
            return (
              <li key={item.key}>
                <NavLink
                  to={item.key}
                  className={[
                    'relative flex items-center gap-2.5 px-5 py-3 text-[13px] font-medium transition',
                    selected
                      ? 'bg-white font-semibold'
                      : 'text-zinc-600 hover:bg-white/60 hover:text-zinc-900',
                  ].join(' ')}
                  style={selected ? { color: 'var(--admin-accent)', borderLeft: '3px solid var(--admin-accent)' } : undefined}
                >
                  <span className="text-[14px]">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-1 px-0 pb-6">
        <button
          type="button"
          onClick={openSettings}
          className="flex w-full items-center gap-2.5 px-5 py-2 text-[13px] text-zinc-600 transition hover:bg-white/60 hover:text-zinc-900"
        >
          <SettingOutlined className="text-[13px]" />
          <span>Settings</span>
        </button>
        <Tooltip
          title="call me 0966490431"
          placement="right"
          mouseEnterDelay={0.15}
          overlayClassName="admin-support-tooltip"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-5 py-2 text-[13px] text-zinc-600 transition hover:bg-white/60 hover:text-zinc-900"
          >
            <QuestionCircleOutlined className="text-[13px]" />
            <span>Support</span>
          </button>
        </Tooltip>
      </div>

      <Modal
        title="Cài đặt website admin"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        onOk={handleSaveSettings}
        okText="Lưu cài đặt"
      >
        <Form form={settingsForm} layout="vertical" className="mt-3">
          <Form.Item
            name="websiteName"
            label="Tên website admin"
            rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}
          >
            <Input maxLength={32} placeholder="Ví dụ: ZenithCrimson" />
          </Form.Item>

          <Form.Item
            name="clientWebsiteName"
            label="Tên website client"
            rules={[{ required: true, message: 'Vui lòng nhập tên website client' }]}
          >
            <Input maxLength={42} placeholder="Ví dụ: Sakura Restaurant" />
          </Form.Item>

          <Form.Item
            name="clientTagline"
            label="Tagline client"
            rules={[{ required: true, message: 'Vui lòng nhập tagline client' }]}
          >
            <Input maxLength={80} placeholder="Ví dụ: Premium Japanese AR Dining" />
          </Form.Item>

          <Form.Item name="themePreset" label="Theme" initialValue="default">
            <Select
              options={[
                { value: 'default', label: 'Default Light' },
                { value: 'soft', label: 'Soft Gray' },
                { value: 'dark', label: 'Dark Contrast' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="accentColor"
            label="Màu nhấn"
            rules={[
              { required: true, message: 'Vui lòng nhập màu nhấn' },
              { pattern: /^#([0-9a-fA-F]{6})$/, message: 'Màu phải ở dạng #RRGGBB' },
            ]}
          >
            <Input placeholder="#c10017" />
          </Form.Item>

          <Form.Item
            name="footerPrimary"
            label="Footer client - dòng 1"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung footer dòng 1' }]}
          >
            <Input.TextArea rows={2} maxLength={180} />
          </Form.Item>

          <Form.Item
            name="footerSecondary"
            label="Footer client - dòng 2"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung footer dòng 2' }]}
          >
            <Input.TextArea rows={2} maxLength={180} />
          </Form.Item>
        </Form>
      </Modal>
    </aside>
  )
}
