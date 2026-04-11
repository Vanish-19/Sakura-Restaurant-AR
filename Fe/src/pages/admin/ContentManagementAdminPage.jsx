import { Button, Card, Col, Row, Tag, Space, Table, Popconfirm, message, Modal, Form, Input, Switch, Avatar } from 'antd'
import { useEffect, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { getAllArticles, createArticle, updateArticle, deleteArticle, getArticleStats } from '../../services/adminArticleApi.js'

export default function ContentManagementAdminPage() {
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({ published: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getAllArticles()
      const statsRes = await getArticleStats()
      if (res?.success) setArticles(res.data)
      if (statsRes?.success) setStats(statsRes.data)
    } catch (err) {
      message.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id)
      message.success('Article deleted')
      fetchData()
    } catch (err) {
      message.error('Failed to delete')
    }
  }

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id)
      form.setFieldsValue({
        title: record.title,
        content: record.content,
        category: record.category,
        author: record.author,
        is_published: record.is_published,
        image_url: record.image_url
      })
    } else {
      setEditingId(null)
      form.resetFields()
      form.setFieldsValue({ is_published: false, category: 'News', author: 'Admin' })
    }
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await updateArticle(editingId, values)
        message.success('Article updated')
      } else {
        await createArticle(values)
        message.success('Article created')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      if (err.errorFields) return
      message.error('Action failed')
    }
  }

  const columns = [
    { title: 'TITLE', dataIndex: 'title', key: 'title', render: (val) => <span className="font-semibold text-zinc-800">{val}</span> },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color={category === 'Promotion' ? 'red' : 'blue'}>{category}</Tag>,
    },
    { 
        title: 'DATE', 
        dataIndex: 'createdAt', 
        key: 'date',
        render: (date) => <span className="text-xs text-zinc-500">{new Date(date).toLocaleDateString()}</span>
    },
    { title: 'AUTHOR', dataIndex: 'author', key: 'author' },
    {
      title: 'STATUS',
      dataIndex: 'is_published',
      key: 'status',
      render: (pub) => (pub ? <Tag color="green">Published</Tag> : <Tag color="default">Draft</Tag>)
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Delete this article?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const statItems = [
    { key: 'published', label: 'PUBLISHED ARTICLES', value: stats.published },
    { key: 'drafts', label: 'DRAFTS PENDING', value: stats.drafts },
    { key: 'views', label: 'TOTAL VIEWS', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0) }
  ]

  const trendingArticle = articles.find(a => a.is_published) || articles[0]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Editorial Studio"
        title="Blog Management"
        subtitle="Curate and publish stories that define Sakura experience"
        action={<Button onClick={() => handleOpenModal()} className="admin-primary-btn" type="primary" icon={<PlusOutlined />}>Create New Post</Button>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel-card h-full">
            <Tag color="red">Trending Now</Tag>
            <h3 className="mt-3 text-3xl font-semibold">
              {trendingArticle ? trendingArticle.title : 'Welcome to the Editorial Studio'}
            </h3>
            <p className="mt-3 text-slate-500">
              {trendingArticle ? `Author: ${trendingArticle.author} • ${trendingArticle.views || 0} views` : 'Begin publishing stories.'}
            </p>
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            {statItems.map((stat) => (
              <Col key={stat.key} xs={12} sm={8} lg={12}>
                <AdminStatCard title={stat.label} value={stat.value} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Card className="admin-panel-card mt-4" title="All Posts" bodyStyle={{ padding: 0 }}>
        <div className="px-5 pb-5 pt-3">
          <Table 
            columns={columns} 
            dataSource={articles} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }} 
          />
        </div>
      </Card>

      <Modal
        title={editingId ? "Edit Article" : "New Article"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category">
               <Input placeholder="News, Promotion, Editorial" />
            </Form.Item>
            <Form.Item name="author" label="Author">
               <Input />
            </Form.Item>
          </div>

          <Form.Item name="image_url" label="Cover Image URL">
            <Input />
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item name="is_published" label="Publish Status" valuePropName="checked">
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
