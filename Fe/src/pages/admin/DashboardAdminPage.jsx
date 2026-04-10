import { Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { dashboardStats, recentOrders } from '../../data/admin/adminMockData.js'

const columns = [
  { title: 'ORDER ID', dataIndex: 'orderId', key: 'orderId' },
  { title: 'CUSTOMER', dataIndex: 'customer', key: 'customer' },
  { title: 'TABLE', dataIndex: 'table', key: 'table' },
  { title: 'AMOUNT', dataIndex: 'amount', key: 'amount' },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Completed' ? 'green' : status === 'Preparing' ? 'orange' : 'red'
      return <Tag color={color}>{status}</Tag>
    },
  },
]

export default function DashboardAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        title="Daily Summary"
        subtitle="Kitchen Pulse and performance overview"
      />

      <Row gutter={[16, 16]}>
        {dashboardStats.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} xl={6}>
            <AdminStatCard title={stat.label} value={stat.value} note={stat.delta} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card className="admin-panel-card" title="Revenue Performance">
            <div className="admin-placeholder">Chart area (backend analytics)</div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-panel-card" title="Peak Performance">
            <div className="admin-side-highlight">Busiest Slot: 19:30 - 21:00</div>
            <div className="admin-side-highlight">Avg Wait Time: 14 minutes</div>
          </Card>
        </Col>
      </Row>

      <Card className="admin-panel-card mt-4" title="Recent Orders">
        <AdminDataTable columns={columns} dataSource={recentOrders} />
      </Card>
    </div>
  )
}
