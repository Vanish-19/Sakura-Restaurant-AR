import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Select, Tabs, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import { getAdminStaticPages, updateAdminStaticPage } from '../../services/staticPageApi.js'

const { Paragraph, Text } = Typography

const pageOrder = ['about', 'contact', 'privacy-policy', 'terms-of-service', 'career', 'press-kit']

const pageLabels = {
  about: 'About',
  contact: 'Contact',
  'privacy-policy': 'Privacy & Policy',
  'terms-of-service': 'Terms Of Service',
  career: 'Careers',
  'press-kit': 'Press Kit',
}

function stringifyContent(content) {
  return JSON.stringify(content || {}, null, 2)
}

function parseJson(value) {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return null
  }
}

export default function StaticResourcesAdminPage() {
  const [form] = Form.useForm()
  const [pages, setPages] = useState([])
  const [activeSlug, setActiveSlug] = useState(pageOrder[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hydrateForm = useCallback((page) => {
    const content = page?.content || {}
    form.setFieldsValue({
      label: page?.label || pageLabels[activeSlug],
      about: content,
      heroEyebrow: content.hero?.eyebrow,
      heroTitle: content.hero?.title,
      heroAccent: content.hero?.accent,
      heroSubtitle: content.hero?.subtitle,
      heroDescription: content.hero?.description,
      heroBackgroundImage: content.hero?.backgroundImage,
      contentJson: stringifyContent(content),
    })
  }, [activeSlug, form])

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAdminStaticPages()
      const sorted = [...(response?.data || [])].sort((a, b) => pageOrder.indexOf(a.slug) - pageOrder.indexOf(b.slug))
      setPages(sorted)
      hydrateForm(sorted.find((page) => page.slug === activeSlug) || sorted[0])
    } catch (error) {
      message.error(error?.message || 'Không thể tải dữ liệu trang static')
    } finally {
      setLoading(false)
    }
  }, [activeSlug, hydrateForm])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const handleTabChange = (slug) => {
    setActiveSlug(slug)
    hydrateForm(pages.find((item) => item.slug === slug))
  }

  const buildGenericContent = (values) => {
    const parsedContent = parseJson(values.contentJson)

    if (!parsedContent) {
      message.error('JSON nội dung mở rộng không hợp lệ')
      return null
    }

    return {
      ...parsedContent,
      hero: {
        ...(parsedContent.hero || {}),
        eyebrow: values.heroEyebrow || undefined,
        title: values.heroTitle || '',
        accent: values.heroAccent || undefined,
        subtitle: values.heroSubtitle || '',
        description: values.heroDescription || undefined,
        backgroundImage: values.heroBackgroundImage || undefined,
      },
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const content = activeSlug === 'about' ? values.about : buildGenericContent(values)
      if (!content) return

      setSaving(true)
      const response = await updateAdminStaticPage(activeSlug, {
        label: values.label,
        content,
      })

      setPages((current) => current.map((page) => (page.slug === activeSlug ? response.data : page)))
      hydrateForm(response.data)
      message.success('Đã lưu tài nguyên trang static')
    } catch (error) {
      if (error?.errorFields) return
      message.error(error?.message || 'Lưu tài nguyên thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Static resources"
        title="Quản lý tài nguyên"
        subtitle="Quản lý nội dung hiển thị cho About, Contact, Privacy, Terms, Careers và Press Kit. Dữ liệu được lưu trong MongoDB để admin và client dùng chung."
        action={
          <Button type="primary" className="admin-primary-btn" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        }
      />

      <Card className="admin-panel-card" loading={loading}>
        <Tabs
          activeKey={activeSlug}
          onChange={handleTabChange}
          items={pageOrder.map((slug) => ({ key: slug, label: pageLabels[slug] }))}
        />

        <Form form={form} layout="vertical" className="mt-4">
          {activeSlug === 'about' ? <AboutResourceForm /> : <GenericResourceForm />}
        </Form>
      </Card>
    </div>
  )
}

function GenericResourceForm() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Card title="Thông tin hero" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true, message: 'Vui lòng nhập tên trang' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="heroEyebrow" label="Eyebrow / nhãn nhỏ">
          <Input placeholder="Ví dụ: Press Kit, Tuyển dụng, Last updated..." />
        </Form.Item>
        <Form.Item name="heroTitle" label="Tiêu đề chính" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề chính' }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="heroAccent" label="Phần nhấn màu trong tiêu đề (nếu có)">
          <Input />
        </Form.Item>
        <Form.Item name="heroSubtitle" label="Phụ đề">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="heroDescription" label="Mô tả">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="heroBackgroundImage" label="Ảnh nền hero">
          <Input placeholder="/headbgPrivacy.png hoặc /presskit/bgheadpress.png" />
        </Form.Item>
      </Card>

      <Card title="Nội dung mở rộng JSON" className="!rounded-lg !border-zinc-200">
        <Paragraph className="!mb-4 !text-sm !leading-6 !text-zinc-500">
          Dùng phần này để lưu các nhóm dữ liệu riêng của từng trang. Trường <Text strong>hero</Text> sẽ được đồng bộ với form bên trái khi lưu.
        </Paragraph>
        <Form.Item
          name="contentJson"
          rules={[{ validator: (_, value) => (parseJson(value) ? Promise.resolve() : Promise.reject(new Error('JSON không hợp lệ'))) }]}
        >
          <Input.TextArea rows={24} className="!font-mono !text-xs" spellCheck={false} />
        </Form.Item>
      </Card>
    </div>
  )
}

function AboutResourceForm() {
  return (
    <div className="space-y-30">
      <Card title="Hero" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true, message: 'Vui lòng nhập tên trang' }]}>
          <Input />
        </Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'hero', 'title']} label="Tiêu đề trước phần nhấn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'hero', 'accent']} label="Phần nhấn màu đỏ">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name={['about', 'hero', 'subtitle']} label="Phụ đề">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name={['about', 'hero', 'backgroundImage']} label="Ảnh nền hero">
          <Input placeholder="/about1.png" />
        </Form.Item>
      </Card>

      <Card title="Câu chuyện thương hiệu" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'story', 'eyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'story', 'title']} label="Tiêu đề section">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name={['about', 'story', 'quote']} label="Quote">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.List name={['about', 'story', 'paragraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn mô tả" />}
        </Form.List>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'story', 'image']} label="Ảnh section">
            <Input placeholder="/about2.png" />
          </Form.Item>
          <Form.Item name={['about', 'story', 'imageAlt']} label="Alt ảnh">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'story', 'cardTitle']} label="Tiêu đề card AR">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'story', 'cardText']} label="Mô tả card AR">
            <Input />
          </Form.Item>
        </div>
      </Card>

      <Card title="Tầm nhìn & Sứ mệnh" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'visionMission', 'title']} label="Tiêu đề section">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'visionMission', 'subtitle']} label="Phụ đề section">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'visionMission', 'visionTitle']} label="Tiêu đề tầm nhìn">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'visionMission', 'missionTitle']} label="Tiêu đề sứ mệnh">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name={['about', 'visionMission', 'visionText']} label="Nội dung tầm nhìn">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name={['about', 'visionMission', 'missionText']} label="Nội dung sứ mệnh">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Card>

      <Card title="Giá trị cốt lõi" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'valuesSection', 'eyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'valuesSection', 'title']} label="Tiêu đề section">
            <Input />
          </Form.Item>
        </div>
        <Form.List name={['about', 'valuesSection', 'items']}>
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map((field) => (
                <Card key={field.key} size="small" className="!rounded-lg">
                  <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                    <Form.Item {...field} name={[field.name, 'icon']} label="Icon">
                      <Select options={[
                        { value: 'safety', label: 'Safety' },
                        { value: 'rocket', label: 'Rocket' },
                        { value: 'heart', label: 'Heart' },
                        { value: 'service', label: 'Service' },
                      ]} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề">
                      <Input />
                    </Form.Item>
                    <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                  </div>
                  <Form.Item {...field} name={[field.name, 'text']} label="Nội dung">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Card>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ icon: 'safety', title: '', text: '' })}>
                Thêm giá trị
              </Button>
            </div>
          )}
        </Form.List>
      </Card>

      <Card title="Trải nghiệm AR" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'arExperience', 'title']} label="Tiêu đề">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'arExperience', 'subtitle']} label="Phụ đề">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'arExperience', 'image']} label="Ảnh minh họa">
            <Input placeholder="/about4.png" />
          </Form.Item>
          <Form.Item name={['about', 'arExperience', 'imageAlt']} label="Alt ảnh">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name={['about', 'arExperience', 'description']} label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.List name={['about', 'arExperience', 'features']}>
          {(fields, { add, remove }) => <EditableObjectList fields={fields} add={add} remove={remove} addLabel="Thêm bước AR" />}
        </Form.List>
      </Card>

      <Card title="Đội ngũ bếp chuyên gia" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'artisans', 'eyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'artisans', 'title']} label="Tiêu đề">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'artisans', 'image']} label="Ảnh">
            <Input placeholder="/about3.png" />
          </Form.Item>
          <Form.Item name={['about', 'artisans', 'imageAlt']} label="Alt ảnh">
            <Input />
          </Form.Item>
        </div>
        <Form.List name={['about', 'artisans', 'paragraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn mô tả" />}
        </Form.List>
        <Form.Item name={['about', 'artisans', 'quote']} label="Quote cuối section">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Card>
    </div>
  )
}

function EditableList({ fields, add, remove, label }) {
  return (
    <div className="mb-4">
      <Text strong>{label}</Text>
      <div className="mt-3 space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex gap-2">
            <Form.Item {...field} className="!mb-0 flex-1">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
        ))}
        <Button icon={<PlusOutlined />} onClick={() => add('')}>
          Thêm đoạn
        </Button>
      </div>
    </div>
  )
}

function EditableObjectList({ fields, add, remove, addLabel }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="flex gap-2">
            <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề" className="flex-1">
              <Input />
            </Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.Item {...field} name={[field.name, 'text']} label="Nội dung">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ title: '', text: '' })}>
        {addLabel}
      </Button>
    </div>
  )
}
