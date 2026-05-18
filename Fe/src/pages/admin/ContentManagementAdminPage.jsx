import { Button, Card, Col, Row, Tag, Space, Table, Popconfirm, message, Modal, Form, Input, Switch, Avatar, Upload, Select } from 'antd'
import { useEffect, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { getAllArticles, createArticle, updateArticle, deleteArticle, getArticleStats, uploadArticleImage } from '../../services/adminArticleApi.js'

export default function ContentManagementAdminPage() {
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({ published: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getAllArticles()
      const statsRes = await getArticleStats()
      if (res?.success) setArticles(res.data)
      if (statsRes?.success) setStats(statsRes.data)
    } catch (err) {
      message.error('Không thể tải danh sách bài viết')
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
      message.success('Đã xóa bài viết')
      fetchData()
    } catch (err) {
      message.error('Không thể xóa bài viết')
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
        message.success('Đã cập nhật bài viết')
      } else {
        await createArticle(values)
        message.success('Đã tạo bài viết mới')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      if (err.errorFields) return
      message.error('Thao tác thất bại')
    }
  }

  const uniqueCategories = [...new Set(articles.map(a => a.category))].filter(Boolean);

  const filteredArticles = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchText.toLowerCase()) || (a.author || '').toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = filterCategory ? a.category === filterCategory : true;
    const matchStatus = filterStatus !== null ? a.is_published === filterStatus : true;
    return matchSearch && matchCategory && matchStatus;
  });

  const columns = [
    { 
      title: 'TITLE', 
      dataIndex: 'title', 
      key: 'title', 
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (val) => <span className="font-semibold text-zinc-800">{val}</span> 
    },
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
        sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        render: (date) => <span className="text-xs text-zinc-500">{new Date(date).toLocaleDateString()}</span>
    },
    { 
      title: 'TÁC GIẢ', 
      dataIndex: 'author', 
      key: 'author'
    },
    {
      title: 'VIEWS',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
      render: (views) => <span className="text-zinc-500">{views || 0}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'is_published',
      key: 'status',
      render: (pub) => (pub ? <Tag color="green">Đã đăng</Tag> : <Tag color="default">Bản nháp</Tag>)
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa bài viết này?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const statItems = [
    { key: 'published', label: 'BÀI ĐÃ ĐĂNG', value: stats.published },
    { key: 'drafts', label: 'BẢN NHÁP', value: stats.drafts },
    { key: 'views', label: 'TỔNG LƯỢT XEM', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0) }
  ]

  const trendingArticle = articles.length > 0 ? [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))[0] : null

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Phòng biên tập"
        title="Quản lý bài viết"
        subtitle="Biên soạn và xuất bản nội dung truyền tải trải nghiệm Sakura"
        action={<Button onClick={() => handleOpenModal()} className="admin-primary-btn" type="primary" icon={<PlusOutlined />}>Tạo bài viết mới</Button>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel-card h-full">
            <Tag color="red">Nổi bật hiện tại</Tag>
            <h3 className="mt-3 text-3xl font-semibold">
              {trendingArticle ? trendingArticle.title : 'Chào mừng đến khu biên tập nội dung'}
            </h3>
            <p className="mt-3 text-slate-500">
              {trendingArticle ? `Tác giả: ${trendingArticle.author} • ${trendingArticle.views || 0} lượt xem` : 'Bắt đầu xuất bản nội dung mới.'}
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

      <Card className="admin-panel-card mt-4" title="Tất cả bài viết" bodyStyle={{ padding: 0 }}>
        <div className="px-5 pt-4 pb-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4">
          <Input.Search 
            placeholder="Tìm theo tiêu đề, tác giả..." 
            allowClear
            onSearch={val => setSearchText(val)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select 
            placeholder="Lọc theo danh mục" 
            allowClear 
            style={{ width: 180 }}
            onChange={val => setFilterCategory(val)}
            options={uniqueCategories.map(c => ({ label: c, value: c }))}
          />
          <Select 
            placeholder="Lọc trạng thái" 
            allowClear 
            style={{ width: 150 }}
            onChange={val => setFilterStatus(val)}
            options={[{ label: 'Đã đăng', value: true }, { label: 'Bản nháp', value: false }]}
          />
        </div>
        <div className="px-5 pb-5 pt-3">
          <Table 
            columns={columns} 
            dataSource={filteredArticles} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }} 
          />
        </div>
      </Card>

      <Modal
        title={editingId ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Danh mục">
              <Input placeholder="Tin tức, khuyến mãi, chia sẻ" />
            </Form.Item>
            <Form.Item name="author" label="Tác giả">
               <Input />
            </Form.Item>
          </div>

          <Form.Item label="Đường dẫn ảnh bìa">
            <div className="flex gap-2">
              <Form.Item name="image_url" noStyle rules={[{ required: true, message: 'Vui lòng nhập đường dẫn hoặc tải lên ảnh bìa!' }]}>
                <Input placeholder="Nhập liên kết ảnh hoặc bấm tải lên file mới..." className="flex-1" />
              </Form.Item>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={async (info) => {
                  const file = info.file;
                  if (!file) return;
                  const key = 'upload-image-msg';
                  message.loading({ content: 'Đang tải ảnh lên Cloudinary...', key });
                  try {
                    const res = await uploadArticleImage(file);
                    if (res?.success) {
                      form.setFieldsValue({ image_url: res.url });
                      message.success({ content: 'Tải ảnh lên thành công!', key });
                    } else {
                      message.error({ content: 'Tải ảnh lên thất bại!', key });
                    }
                  } catch (err) {
                    message.error({ content: 'Lỗi upload: ' + (err.message || err), key });
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item name="is_published" label="Trạng thái xuất bản" valuePropName="checked">
            <Switch checkedChildren="Đã đăng" unCheckedChildren="Nháp" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
