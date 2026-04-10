import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { dishes, foodStats } from '../../data/admin/adminMockData.js'

const columns = [
  { title: 'DISH NAME', dataIndex: 'dish', key: 'dish' },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  {
    title: 'CATEGORY',
    dataIndex: 'category',
    key: 'category',
    render: (value) => <Tag>{value}</Tag>,
  },
  { title: 'PRICE', dataIndex: 'price', key: 'price' },
  {
    title: 'AR STATUS',
    dataIndex: 'arStatus',
    key: 'arStatus',
    render: (value) => <Tag color={value === 'Available' ? 'red' : 'gold'}>{value}</Tag>,
  },
]

export default function FoodManagementAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        title="Food Management"
        subtitle="Curate your culinary offerings and manage AR experiences"
        action={
          <Button type="primary" icon={<PlusOutlined />} className="admin-primary-btn">
            Add New Dish
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        {foodStats.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} xl={6}>
            <AdminStatCard title={stat.label} value={stat.value} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-4" title="Dishes">
        <AdminDataTable columns={columns} dataSource={dishes} />
      </Card>

      <Card className="admin-panel-card admin-promo-card mt-4">
        <div>
          <div className="admin-section-header__eyebrow">Innovation Highlight</div>
          <h3 className="admin-promo-card__title">Bring your menu to life with AR experiences</h3>
          <p className="admin-promo-card__text">
            Customers are more likely to order dishes when they can preview 3D assets.
          </p>
          <Button type="primary" className="admin-primary-btn">Manage AR Assets</Button>
        </div>
      </Card>
    </div>
  )
}
