import { BellOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Input, Space } from 'antd'

export default function AdminTopbar() {
  return (
    <div className="admin-topbar">
      <Input
        className="admin-topbar__search"
        prefix={<SearchOutlined />}
        placeholder="Search orders, dishes, users..."
      />

      <Space size={12}>
        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined />} className="admin-topbar__icon-btn" />
        </Badge>
        <Avatar icon={<UserOutlined />} className="admin-topbar__avatar" />
      </Space>
    </div>
  )
}
