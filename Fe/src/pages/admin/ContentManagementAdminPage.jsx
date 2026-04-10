import { Button, Card, Col, Row, Tag } from 'antd'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { articleStats, articles } from '../../data/admin/adminMockData.js'

const columns = [
  { title: 'TITLE', dataIndex: 'title', key: 'title' },
  {
    title: 'CATEGORY',
    dataIndex: 'category',
    key: 'category',
    render: (category) => <Tag color={category === 'Promotion' ? 'red' : 'blue'}>{category}</Tag>,
  },
  { title: 'DATE', dataIndex: 'date', key: 'date' },
  { title: 'AUTHOR', dataIndex: 'author', key: 'author' },
]

export default function ContentManagementAdminPage() {
  return (
    <div className="admin-page">
      <AdminSectionHeader
        eyebrow="Editorial Studio"
        title="Blog Management"
        subtitle="Curate and publish stories that define Sakura experience"
        action={<Button className="admin-primary-btn" type="primary">Create New Post</Button>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel-card">
            <Tag color="red">Trending Now</Tag>
            <h3 className="mt-3 text-3xl font-semibold">The Art of the Perfect Omakase: A Seasonal Journey</h3>
            <p className="mt-3 text-slate-500">Author: Kenji Yamamoto • 2.4k views</p>
          </Card>
        </Col>
        {articleStats.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} lg={5}>
            <AdminStatCard title={stat.label} value={stat.value} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-4" title="All Posts">
        <AdminDataTable columns={columns} dataSource={articles} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  )
}
