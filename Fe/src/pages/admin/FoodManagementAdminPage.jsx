import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Card, Col, Input, Space, Table, Tag, message, Avatar, Popconfirm, Modal, Form, InputNumber, Switch, Select, Upload, Row } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllFoods, createFood, updateFood, deleteFood, uploadFoodModel } from '../../services/adminFoodApi.js'
import { createFoodCategory, deleteFoodCategory, getAllFoodCategories, updateFoodCategory } from '../../services/adminFoodCategoryApi.js'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0))

const formatCategoryLabel = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''

  return text
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

const normalizeTagValues = (values) =>
  [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))]

function buildFoodProfileBadges(food) {
  return [
    food.is_best_seller ? { label: 'Bán chạy', color: 'gold' } : null,
  ].filter(Boolean)
}

async function convertGlbToUsdzInBrowser(glbFile) {
  const [{ GLTFLoader }, { USDZExporter }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/exporters/USDZExporter.js'),
  ])

  const objectUrl = URL.createObjectURL(glbFile)

  try {
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(objectUrl)

    const exporter = new USDZExporter()
    const usdzArrayBuffer = await exporter.parseAsync(gltf.scene, {
      maxTextureSize: 2048,
    })

    return new File(
      [usdzArrayBuffer],
      String(glbFile.name || 'model.glb').replace(/\.glb$/i, '.usdz'),
      { type: 'model/vnd.usdz+zip' },
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export default function FoodManagementAdminPage() {
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false)
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null)
  const [uploadingModelType, setUploadingModelType] = useState(null)
  const [foodSearchText, setFoodSearchText] = useState('')
  const [categorySearchText, setCategorySearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [form] = Form.useForm()
  const [categoryForm] = Form.useForm()
  const [deleteCategoryForm] = Form.useForm()

  const allowedModelTypes = ['glb', 'usdz']

  const categoryFoodCounts = useMemo(() => {
    return foods.reduce((acc, food) => {
      const key = String(food.category || '').trim()
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }, [foods])

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.name,
      label: formatCategoryLabel(category.name),
    }))
  }, [categories])

  const otherCategoryOptions = useMemo(() => {
    if (!pendingDeleteCategory) return categoryOptions
    return categoryOptions.filter((category) => category.value !== pendingDeleteCategory.name)
  }, [categoryOptions, pendingDeleteCategory])

  const filteredFoods = useMemo(() => {
    const keyword = String(foodSearchText || '').trim().toLowerCase()

    return foods.filter((food) => {
      const matchesKeyword =
        keyword.length === 0 ||
        String(food?.name || '').toLowerCase().includes(keyword) ||
        String(food?.description || '').toLowerCase().includes(keyword)
      const matchesCategory = filterCategory ? food.category === filterCategory : true
      const matchesAvailability =
        filterAvailability === 'all'
          ? true
          : filterAvailability === 'available'
            ? Boolean(food.is_available)
            : !food.is_available

      return matchesKeyword && matchesCategory && matchesAvailability
    })
  }, [filterAvailability, filterCategory, foodSearchText, foods])

  const filteredCategories = useMemo(() => {
    const keyword = String(categorySearchText || '').trim().toLowerCase()
    if (!keyword) return categories

    return categories.filter((category) =>
      formatCategoryLabel(category.name).toLowerCase().includes(keyword),
    )
  }, [categories, categorySearchText])

  const beforeModelUpload = (expectedType) => (file) => {
    const extension = String(file?.name || '').split('.').pop()?.toLowerCase()
    if (extension !== expectedType) {
      message.error(`Vui lòng chọn file .${expectedType}`)
      return Upload.LIST_IGNORE
    }

    const isWithinLimit = (file?.size || 0) <= 20 * 1024 * 1024
    if (!isWithinLimit) {
      message.error('Kích thước file tối đa là 40MB')
      return Upload.LIST_IGNORE
    }

    return true
  }

  const handleUploadModel = (modelType) => async ({ file, onSuccess, onError }) => {
    if (!allowedModelTypes.includes(modelType)) {
      onError?.(new Error('Loại model không hợp lệ'))
      return
    }

    try {
      setUploadingModelType(modelType)
      const res = await uploadFoodModel(file, modelType)
      const uploadedUrl = res?.data?.url
      if (!uploadedUrl) {
        throw new Error('Không nhận được URL model từ server')
      }

      if (modelType === 'glb') {
        let usdzUrl = res?.data?.convertedUsdz?.url

        if (!usdzUrl) {
          try {
            message.loading({
              content: 'Đang convert GLB -> USDZ trên trình duyệt để giữ màu...',
              key: 'glb-usdz-convert',
              duration: 0,
            })

            const usdzFile = await convertGlbToUsdzInBrowser(file)
            const usdzRes = await uploadFoodModel(usdzFile, 'usdz')
            usdzUrl = usdzRes?.data?.url || ''

            message.success({
              content: 'Convert và upload USDZ thành công (giữ màu tốt hơn)',
              key: 'glb-usdz-convert',
            })
          } catch (convertError) {
            message.warning({
              content: `Không thể auto-convert USDZ giữ màu: ${convertError?.message || 'unknown error'}`,
              key: 'glb-usdz-convert',
            })
          }
        }

        form.setFieldsValue({
          glb_url: uploadedUrl,
          ...(usdzUrl ? { usdz_url: usdzUrl } : {}),
        })
      } else {
        form.setFieldsValue({ usdz_url: uploadedUrl })
        message.success('Upload .usdz thành công')
      }

      onSuccess?.(res, file)
    } catch (err) {
      message.error(err?.message || `Upload .${modelType} thất bại`)
      onError?.(err)
    } finally {
      setUploadingModelType(null)
    }
  }

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getAllFoods()
      if (res?.success) {
        setFoods(res.data || [])
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách món ăn')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true)
      const res = await getAllFoodCategories()
      if (res?.success) {
        setCategories(res.data || [])
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh mục món ăn')
    } finally {
      setCategoryLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.all([fetchFoods(), fetchCategories()])
  }, [fetchCategories, fetchFoods])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleDelete = async (id) => {
    try {
      await deleteFood(id)
      message.success('Đã xóa món ăn')
      fetchFoods()
    } catch {
      message.error('Không thể xóa món ăn')
    }
  }

  const handleOpenCategoryModal = (record = null) => {
    if (record) {
      setEditingCategoryId(record._id)
      categoryForm.setFieldsValue({ name: record.name })
    } else {
      setEditingCategoryId(null)
      categoryForm.resetFields()
    }
    setIsCategoryModalOpen(true)
  }

  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields()

      if (editingCategoryId) {
        await updateFoodCategory(editingCategoryId, values)
        message.success('Cập nhật danh mục thành công')
      } else {
        await createFoodCategory(values)
        message.success('Tạo danh mục thành công')
      }

      setIsCategoryModalOpen(false)
      setEditingCategoryId(null)
      categoryForm.resetFields()
      refreshData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message || 'Thao tác thất bại')
    }
  }

  const handleRequestDeleteCategory = (record) => {
    const usedCount = categoryFoodCounts[record.name] || 0
    const availableReplacements = categoryOptions.filter((category) => category.value !== record.name)

    if (usedCount > 0 && availableReplacements.length === 0) {
      message.error('Không thể xóa danh mục cuối cùng đang được dùng bởi món ăn')
      return
    }

    setPendingDeleteCategory(record)
    deleteCategoryForm.resetFields()
    if (usedCount > 0 && availableReplacements.length > 0) {
      deleteCategoryForm.setFieldsValue({ replacementName: availableReplacements[0].value })
    }
    setIsDeleteCategoryModalOpen(true)
  }

  const handleDeleteCategoryModalOk = async () => {
    try {
      if (!pendingDeleteCategory) return

      const usedCount = categoryFoodCounts[pendingDeleteCategory.name] || 0
      const values = await deleteCategoryForm.validateFields()
      const payload = usedCount > 0 ? { replacementName: values.replacementName } : {}

      await deleteFoodCategory(pendingDeleteCategory._id, payload)
      message.success('Đã xóa danh mục')
      setIsDeleteCategoryModalOpen(false)
      setPendingDeleteCategory(null)
      deleteCategoryForm.resetFields()
      refreshData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message || 'Không thể xóa danh mục')
    }
  }

  const handleCloseDeleteCategoryModal = () => {
    setIsDeleteCategoryModalOpen(false)
    setPendingDeleteCategory(null)
    deleteCategoryForm.resetFields()
  }

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id)
      form.setFieldsValue({
        name: record.name,
        price: record.price,
        category: record.category,
        is_available: record.is_available,
        is_best_seller: record.is_best_seller,
        image_url: record.image_url,
        glb_url: record.ar_models?.glb_url,
        usdz_url: record.ar_models?.usdz_url,
        description: record.description,
        ingredients: record.ingredients || [],
        allergens: record.allergens || [],
        recommended_for: record.recommended_for || [],
      })
    } else {
      setEditingId(null)
      form.resetFields()
      form.setFieldsValue({
        is_available: true,
        is_best_seller: false,
        ingredients: [],
        allergens: [],
        recommended_for: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        name: values.name,
        price: values.price,
        category: values.category,
        is_available: values.is_available,
        is_best_seller: values.is_best_seller,
        image_url: values.image_url,
        description: values.description,
        ingredients: normalizeTagValues(values.ingredients),
        allergens: normalizeTagValues(values.allergens),
        recommended_for: normalizeTagValues(values.recommended_for),
        ar_models: {
          glb_url: values.glb_url,
          usdz_url: values.usdz_url,
        },
      }

      if (editingId) {
        await updateFood(editingId, payload)
        message.success('Cập nhật món ăn thành công')
      } else {
        await createFood(payload)
        message.success('Tạo món ăn thành công')
      }
      setIsModalOpen(false)
      fetchFoods()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message || 'Thao tác thất bại')
    }
  }

  const columns = [
    {
      title: 'DISH',
      key: 'dish',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.image_url} shape="square" size={40} className="!bg-zinc-100 border border-zinc-200" />
          <div>
            <p className="m-0 text-[13px] font-bold text-zinc-900">{row.name}</p>
            <p className="m-0 text-[11px] text-zinc-500 w-48 truncate">{row.description}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {buildFoodProfileBadges(row).map((badge) => (
                <Tag key={badge.label} color={badge.color} className="!m-0">
                  {badge.label}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag className="!rounded-md !border-zinc-200 !bg-zinc-100 !px-2 !py-0.5 !font-semibold uppercase">{formatCategoryLabel(value)}</Tag>,
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="font-semibold">{formatVnd(price)} VNĐ</span>,
    },
    {
      title: 'AR STATUS',
      key: 'arStatus',
      render: (_, row) => {
        const hasGlb = !!row.ar_models?.glb_url
        const hasUsdz = !!row.ar_models?.usdz_url
        if (hasGlb || hasUsdz) return <Tag color="blue">Đã bật</Tag>
        return <Tag color="default">Thiếu</Tag>
      },
    },
    {
      title: 'BEST SELLER',
      dataIndex: 'is_best_seller',
      key: 'bestSeller',
      render: (isBestSeller) => (
        isBestSeller ? <Tag color="gold">Bán chạy</Tag> : <Tag>Thường</Tag>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'is_available',
      key: 'status',
      render: (is_available) => (
        is_available ? <Tag color="green">Đang bán</Tag> : <Tag color="red">Đã ẩn</Tag>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa món này?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const categoryColumns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <span className="font-semibold text-zinc-900">{formatCategoryLabel(value)}</span>,
    },
    {
      title: 'FOODS',
      key: 'foods',
      render: (_, record) => <Tag color="blue">{categoryFoodCounts[record.name] || 0}</Tag>,
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleOpenCategoryModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa danh mục này?" onConfirm={() => handleRequestDeleteCategory(record)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const stats = [
    { key: 'total', title: 'TỔNG MÓN ĂN', value: foods.length, note: 'Trong thực đơn' },
    { key: 'best', title: 'MÓN BÁN CHẠY', value: foods.filter((f) => f.is_best_seller).length, note: 'Danh sách ưu tiên' },
    { key: 'ar', title: 'CÓ AR', value: foods.filter((f) => f.ar_models?.glb_url || f.ar_models?.usdz_url).length, note: 'Có mô hình 3D' },
    { key: 'active', title: 'ĐANG BÁN', value: foods.filter((f) => f.is_available).length, note: 'Sẵn sàng phục vụ' },
    { key: 'categories', title: 'DANH MỤC', value: categories.length, note: 'Đang quản lý' },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Kitchen Catalog"
        title="Quản lý món ăn"
        subtitle="Quản lý thực đơn số, cập nhật giá bán, mô hình AR và danh mục món theo cùng nhịp hiển thị với trang blog."
        action={
          <Button onClick={() => handleOpenModal()} icon={<PlusOutlined />} className="admin-primary-btn" type="primary">
            Thêm món mới
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={stat.key} xs={24} sm={12} lg={8} xl={4}>
            <AdminStatCard title={stat.title} value={stat.value} note={stat.note} accent={index === 1} />
          </Col>
        ))}
      </Row>

      <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Quản lý danh mục</h3>
            <p className="admin-toolbar__description">Tra cứu nhanh từng nhóm món trước khi đổi tên, gộp hoặc xóa danh mục.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Input
              allowClear
              value={categorySearchText}
              onChange={(event) => setCategorySearchText(event.target.value)}
              placeholder="Tìm danh mục..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              className="admin-toolbar__search"
            />
            <Button onClick={() => handleOpenCategoryModal()} icon={<PlusOutlined />} className="admin-primary-btn" type="primary">
              Thêm danh mục
            </Button>
          </div>
        </div>

        <div className="px-3 pb-3 pt-1">
          <Table
            columns={categoryColumns}
            dataSource={filteredCategories}
            rowKey="_id"
            loading={categoryLoading}
            pagination={{ pageSize: 7 }}
            rowClassName={() => 'hover:!bg-zinc-50'}
          />
        </div>
      </Card>

      <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Danh sách món ăn</h3>
            <p className="admin-toolbar__description">Tìm món theo tên, mô tả và lọc theo danh mục hoặc trạng thái đang bán.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Input
              allowClear
              value={foodSearchText}
              onChange={(event) => setFoodSearchText(event.target.value)}
              placeholder="Tìm tên món hoặc mô tả..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              className="admin-toolbar__search"
            />
            <Select
              allowClear
              placeholder="Lọc theo danh mục"
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
              style={{ width: 200 }}
            />
            <Select
              value={filterAvailability}
              onChange={setFilterAvailability}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Đang bán', value: 'available' },
                { label: 'Đã ẩn', value: 'hidden' },
              ]}
              style={{ width: 170 }}
            />
          </div>
        </div>

        <div className="px-3 pb-3 pt-1">
          <Table
            columns={columns}
            dataSource={filteredFoods}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: 940 }}
            rowClassName={() => 'hover:!bg-zinc-50'}
          />
        </div>
      </Card>

      <Modal
        title={editingId ? 'Cập nhật món ăn' : 'Tạo món ăn mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Tên món" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
              <Select
                showSearch
                placeholder="Chọn danh mục"
                options={categoryOptions}
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]}>
              <InputNumber
                className="w-full"
                min={0}
                step={1000}
                precision={0}
                addonAfter="VNĐ"
                formatter={(value) => formatVnd(value)}
                parser={(value) => String(value || '').replace(/\D/g, '')}
              />
            </Form.Item>
            <Form.Item name="is_available" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Đang bán" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <Form.Item name="is_best_seller" label="Món bán chạy" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="ingredients" label="Nguyên liệu chính">
            <Select
              mode="tags"
              tokenSeparators={[',']}
              placeholder="Ví dụ: salmon, avocado, rice"
              open={false}
            />
          </Form.Item>

          <Form.Item name="allergens" label="Lưu ý dị ứng">
            <Select
              mode="tags"
              tokenSeparators={[',']}
              placeholder="Ví dụ: fish, shellfish, wheat"
              open={false}
            />
          </Form.Item>

          <Form.Item name="recommended_for" label="Phù hợp với">
            <Select
              mode="tags"
              tokenSeparators={[',']}
              placeholder="Ví dụ: first-time guests, sharing, ăn nhẹ"
              open={false}
            />
          </Form.Item>

          <Form.Item name="image_url" label="Đường dẫn ảnh">
            <Input />
          </Form.Item>

          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="m-0 text-[12px] text-blue-700 font-medium">
              💡 Upload file .glb sẽ tự động convert sang .usdz (iOS)
            </p>
            <p className="m-0 mt-1 text-[11px] text-blue-500">
              Bạn chỉ cần upload file GLB, hệ thống sẽ tự tạo file USDZ tương ứng.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
            <Form.Item name="glb_url" label="Mô hình AR (.glb) - Android/Web">
              <Input
                placeholder="https://..."
                addonAfter={(
                  <Upload
                    accept=".glb"
                    showUploadList={false}
                    beforeUpload={beforeModelUpload('glb')}
                    customRequest={handleUploadModel('glb')}
                  >
                    <Button size="small" type="text" icon={<UploadOutlined />} loading={uploadingModelType === 'glb'}>
                      Upload
                    </Button>
                  </Upload>
                )}
              />
            </Form.Item>
            <Form.Item name="usdz_url" label="Mô hình AR (.usdz) - iOS">
              <Input
                placeholder="https://..."
                addonAfter={(
                  <Upload
                    accept=".usdz"
                    showUploadList={false}
                    beforeUpload={beforeModelUpload('usdz')}
                    customRequest={handleUploadModel('usdz')}
                  >
                    <Button size="small" type="text" icon={<UploadOutlined />} loading={uploadingModelType === 'usdz'}>
                      Upload
                    </Button>
                  </Upload>
                )}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isCategoryModalOpen}
        onOk={handleCategoryModalOk}
        onCancel={() => {
          setIsCategoryModalOpen(false)
          setEditingCategoryId(null)
          categoryForm.resetFields()
        }}
        okText="Lưu"
        width={520}
      >
        <Form form={categoryForm} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="Ví dụ: sushi, ramen, desserts" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xóa danh mục"
        open={isDeleteCategoryModalOpen}
        onOk={handleDeleteCategoryModalOk}
        onCancel={handleCloseDeleteCategoryModal}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        width={560}
      >
        <Form form={deleteCategoryForm} layout="vertical" className="mt-4">
          <p className="mb-3 text-sm text-zinc-600">
            {pendingDeleteCategory ? (
              <>
                Bạn đang xóa danh mục <span className="font-semibold text-zinc-900">{formatCategoryLabel(pendingDeleteCategory.name)}</span>.
                {categoryFoodCounts[pendingDeleteCategory.name] > 0 ? ' Danh mục này đang được dùng bởi món ăn, hãy chọn danh mục thay thế.' : ' Danh mục này chưa được dùng bởi món nào.'}
              </>
            ) : null}
          </p>

          {pendingDeleteCategory && categoryFoodCounts[pendingDeleteCategory.name] > 0 ? (
            <Form.Item
              name="replacementName"
              label="Danh mục thay thế"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục thay thế' }]}
            >
              <Select options={otherCategoryOptions} placeholder="Chọn danh mục thay thế" />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  )
}
