import { Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { userStats, users } from '../../data/admin/adminMockData.js'

const columns = [
  {
    title: 'USER DETAILS',
    dataIndex: 'name',
    key: 'name',
    render: (_, row) => (
      <div>
        <div className="font-semibold text-slate-900">{row.name}</div>
        <div className="text-xs text-slate-500">{row.email}</div>
      </div>
    ),
  },
  {
    title: 'ROLE',
    dataIndex: 'role',
    key: 'role',
    render: (role) => <Tag>{role}</Tag>,
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Verified' ? 'green' : status === 'Pending' ? 'orange' : 'default'
      return <Tag color={color}>{status}</Tag>
    },
  },
  { title: 'LAST LOGIN', dataIndex: 'lastLogin', key: 'lastLogin' },
]

export default function UserManagementAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        title="User Management"
        subtitle="Manage access levels and account status for the Zenith Crimson ecosystem"
      />

      <Row gutter={[16, 16]}>
        {userStats.map((stat) => (
          <Col key={stat.key} xs={24} md={12}>
            <AdminStatCard title={stat.label} value={stat.value} note={stat.note} />
          </Col>
        ))}
        <Col xs={24} xl={12}>
          <Card className="admin-panel-card admin-warning-card">
            <div className="admin-section-header__eyebrow">System Health</div>
            <h3 className="text-3xl font-semibold text-white">Account Security Protocol</h3>
            <p className="text-white/90">99.8% of accounts verified with multi-factor auth.</p>
          </Card>
        </Col>
      </Row>

      <Card className="admin-panel-card mt-4" title="Account Registry">
        <AdminDataTable columns={columns} dataSource={users} pagination={{ pageSize: 6 }} />
      </Card>
    </div>
  )
}
