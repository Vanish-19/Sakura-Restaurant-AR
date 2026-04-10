import { Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { activeOrders, orderStats } from '../../data/admin/adminMockData.js'

const columns = [
  { title: 'ORDER ID', dataIndex: 'orderId', key: 'orderId' },
  { title: 'CUSTOMER', dataIndex: 'customer', key: 'customer' },
  {
    title: 'TABLE',
    dataIndex: 'table',
    key: 'table',
    render: (value) => <Tag>{value}</Tag>,
  },
  { title: 'AMOUNT', dataIndex: 'amount', key: 'amount' },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Served' ? 'green' : status === 'Preparing' ? 'orange' : 'red'
      return <Tag color={color}>{status}</Tag>
    },
  },
  {
    title: 'ACTION',
    dataIndex: 'action',
    key: 'action',
    render: (action) => <Tag color="default">{action}</Tag>,
  },
]

export default function OrderManagementAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        title="Order Management"
        subtitle="Real-time control over kitchen pulse and dine-in floor logistics"
      />

      <Row gutter={[16, 16]}>
        {orderStats.map((stat, idx) => (
          <Col key={stat.key} xs={24} md={8}>
            <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-4" title="Active Dine-in Orders">
        <AdminDataTable columns={columns} dataSource={activeOrders} />
      </Card>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card className="admin-panel-card admin-warning-card">
            <div className="admin-warning-card__quote">"Precision is the ingredient of perfection."</div>
            <p>Kitchen backlog is currently at 85%. Consider slowing down delivery intakes.</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-panel-card" title="New Manual Order">
            <p>Click below to create quick order for phone bookings or walk-ins.</p>
            <button type="button" className="admin-neutral-btn">Quick Create</button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
