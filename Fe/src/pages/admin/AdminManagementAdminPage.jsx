import { Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { adminAccounts, adminStats } from '../../data/admin/adminMockData.js'

const columns = [
  {
    title: 'NAME',
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
    render: (role) => <Tag color={role === 'Super Admin' ? 'red' : 'default'}>{role}</Tag>,
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>,
  },
  { title: 'LAST LOGIN', dataIndex: 'lastLogin', key: 'lastLogin' },
]

export default function AdminManagementAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        title="Admin Management"
        subtitle="Control system access and security permissions"
      />

      <Row gutter={[16, 16]}>
        {adminStats.map((stat, idx) => (
          <Col key={stat.key} xs={24} md={8}>
            <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} xl={17}>
          <Card className="admin-panel-card" title="Active Access Accounts">
            <AdminDataTable columns={columns} dataSource={adminAccounts} pagination={{ pageSize: 5 }} />
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Card className="admin-panel-card" title="Security Settings">
            <div className="admin-security-item">Two-factor auth: Enabled</div>
            <div className="admin-security-item">Audit logs</div>
            <div className="admin-security-item">API tokens</div>
            <div className="admin-security-item">Access policies</div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
