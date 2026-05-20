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
      contact: content,
      privacy: content,
      terms: content,
      career: content,
      pressKit: content,
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
      const content =
        activeSlug === 'about'
          ? values.about
          : activeSlug === 'contact'
            ? values.contact
            : activeSlug === 'privacy-policy'
              ? values.privacy
              : activeSlug === 'terms-of-service'
                ? values.terms
                : activeSlug === 'career'
                  ? values.career
                  : activeSlug === 'press-kit'
                    ? values.pressKit
                    : buildGenericContent(values)
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
          {activeSlug === 'about' ? <AboutResourceForm /> : null}
          {activeSlug === 'contact' ? <ContactResourceForm /> : null}
          {activeSlug === 'privacy-policy' ? <PrivacyResourceForm /> : null}
          {activeSlug === 'terms-of-service' ? <TermsResourceForm /> : null}
          {activeSlug === 'career' ? <CareerResourceForm /> : null}
          {activeSlug === 'press-kit' ? <PressKitResourceForm /> : null}
          {!['about', 'contact', 'privacy-policy', 'terms-of-service', 'career', 'press-kit'].includes(activeSlug) ? <GenericResourceForm /> : null}
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
    <div className="flex flex-col gap-8">
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
          <Form.Item name={['about', 'brandStory', 'eyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'brandStory', 'title']} label="Tiêu đề section">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name={['about', 'brandStory', 'quote']} label="Quote">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.List name={['about', 'brandStory', 'paragraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn mô tả" />}
        </Form.List>
        <Form.Item name={['about', 'brandStory', 'highlight']} label="Đoạn nhấn cuối">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'brandStory', 'image']} label="Ảnh section">
            <Input placeholder="/about2.png" />
          </Form.Item>
          <Form.Item name={['about', 'brandStory', 'previewCard', 'title']} label="Tiêu đề card AR">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'brandStory', 'previewCard', 'subtitle']} label="Mô tả card AR">
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
        </div>
        <Form.Item name={['about', 'visionMission', 'vision']} label="Nội dung tầm nhìn">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name={['about', 'visionMission', 'mission']} label="Nội dung sứ mệnh">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Card>

      <Card title="Giá trị cốt lõi" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['about', 'coreValuesEyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'coreValuesTitle']} label="Tiêu đề section">
            <Input />
          </Form.Item>
        </div>
        <Form.List name={['about', 'coreValues']}>
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map((field) => (
                <Card key={field.key} size="small" className="!rounded-lg">
                  <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                    <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon">
                      <Select options={[
                        { value: 'safety-certificate', label: 'Safety' },
                        { value: 'rocket', label: 'Rocket' },
                        { value: 'heart', label: 'Heart' },
                        { value: 'customer-service', label: 'Service' },
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
              <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'safety-certificate', title: '', text: '' })}>
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
          <Form.Item name={['about', 'chefStory', 'eyebrow']} label="Nhãn nhỏ">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'chefStory', 'title']} label="Tiêu đề">
            <Input />
          </Form.Item>
          <Form.Item name={['about', 'chefStory', 'image']} label="Ảnh">
            <Input placeholder="/about3.png" />
          </Form.Item>
        </div>
        <Form.List name={['about', 'chefStory', 'paragraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn mô tả" />}
        </Form.List>
        <Form.Item name={['about', 'chefStory', 'highlight']} label="Quote cuối section">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Card>
    </div>
  )
}

function ContactResourceForm() {
  return (
    <div className="flex flex-col gap-8">
      <Card title="Hero" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'hero', 'title']} label="Tiêu đề">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'hero', 'subtitle']} label="Phụ đề">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'hero', 'description']} label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name={['contact', 'hero', 'backgroundImage']} label="Ảnh nền">
          <Input placeholder="/bgheadContact.png" />
        </Form.Item>
      </Card>

      <Card title="Thông tin liên hệ" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['contact', 'contactSection', 'title']} label="Tiêu đề khối">
          <Input />
        </Form.Item>
        <Form.List name={['contact', 'contactSection', 'items']}>
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map((field) => (
                <Card key={field.key} size="small" className="!rounded-lg">
                  <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
                    <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon">
                      <Select options={[
                        { value: 'environment', label: 'Địa chỉ' },
                        { value: 'phone', label: 'Phone' },
                        { value: 'mail', label: 'Mail' },
                        { value: 'clock-circle', label: 'Clock' },
                      ]} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề">
                      <Input />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'action']} label="Nút phụ">
                      <Input />
                    </Form.Item>
                    <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                  </div>
                  <Form.List name={[field.name, 'lines']}>
                    {(lineFields, lineOps) => <EditableList fields={lineFields} add={lineOps.add} remove={lineOps.remove} label="Các dòng nội dung" />}
                  </Form.List>
                </Card>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'environment', title: '', lines: [''] })}>Thêm thông tin</Button>
            </div>
          )}
        </Form.List>
      </Card>

      <Card title="Card hỗ trợ AR" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['contact', 'supportCard', 'title']} label="Tiêu đề">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'supportCard', 'description']} label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name={['contact', 'supportCard', 'actionLabel']} label="Nhãn nút">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'supportCard', 'backgroundImage']} label="Ảnh nền">
          <Input />
        </Form.Item>
      </Card>

      <Card title="Form liên hệ" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['contact', 'contactForm', 'title']} label="Tiêu đề form">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'contactForm', 'submitLabel']} label="Nhãn nút gửi">
          <Input />
        </Form.Item>
        <Form.Item name={['contact', 'contactForm', 'successMessage']} label="Thông báo gửi thành công">
          <Input.TextArea rows={2} />
        </Form.Item>
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          {[
            ['name', 'Họ tên'],
            ['phone', 'Số điện thoại'],
            ['email', 'Email'],
            ['purpose', 'Mục đích liên hệ'],
            ['guests', 'Số lượng khách'],
            ['message', 'Tin nhắn'],
          ].map(([key, label]) => (
            <Card key={key} size="small" title={label} className="!rounded-lg">
              <Form.Item name={['contact', 'contactForm', 'fields', key, 'label']} label="Label">
                <Input />
              </Form.Item>
              <Form.Item name={['contact', 'contactForm', 'fields', key, 'placeholder']} label="Placeholder">
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item name={['contact', 'contactForm', 'fields', key, 'requiredMessage']} label="Thông báo bắt buộc">
                <Input />
              </Form.Item>
              {key === 'email' ? (
                <Form.Item name={['contact', 'contactForm', 'fields', key, 'invalidMessage']} label="Thông báo email không hợp lệ">
                  <Input />
                </Form.Item>
              ) : null}
            </Card>
          ))}
        </div>
        <Form.List name={['contact', 'contactForm', 'purposeOptions']}>
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              <Text strong>Mục đích liên hệ</Text>
              {fields.map((field) => (
                <div key={field.key} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Form.Item {...field} name={[field.name, 'value']} className="!mb-0">
                    <Input placeholder="value" />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'label']} className="!mb-0">
                    <Input placeholder="label" />
                  </Form.Item>
                  <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                </div>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ value: '', label: '' })}>Thêm lựa chọn</Button>
            </div>
          )}
        </Form.List>
      </Card>

      <Card title="Các card dịch vụ cuối trang" className="!rounded-lg !border-zinc-200">
        <Form.List name={['contact', 'serviceCards']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm card dịch vụ" />}
        </Form.List>
      </Card>
    </div>
  )
}

function PrivacyResourceForm() {
  return (
    <div className="flex flex-col gap-8">
      <Card title="Hero & sidebar" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['privacy', 'hero', 'eyebrow']} label="Nhãn cập nhật"><Input /></Form.Item>
          <Form.Item name={['privacy', 'hero', 'backgroundImage']} label="Ảnh nền"><Input /></Form.Item>
        </div>
        <Form.Item name={['privacy', 'hero', 'title']} label="Tiêu đề"><Input /></Form.Item>
        <Form.Item name={['privacy', 'hero', 'subtitle']} label="Phụ đề"><Input /></Form.Item>
        <Form.Item name={['privacy', 'tocTitle']} label="Tiêu đề mục lục"><Input /></Form.Item>
        <Form.Item name={['privacy', 'supportTitle']} label="Tiêu đề box hỗ trợ"><Input /></Form.Item>
        <Form.Item name={['privacy', 'supportText']} label="Mô tả box hỗ trợ"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name={['privacy', 'supportButtonLabel']} label="Nút hỗ trợ"><Input /></Form.Item>
        <Form.Item name={['privacy', 'contentMoreLabel']} label="Nút xem thêm"><Input /></Form.Item>
      </Card>

      <Card title="Danh sách section" className="!rounded-lg !border-zinc-200">
        <Form.List name={['privacy', 'sections']}>
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key} className="grid gap-3 md:grid-cols-[90px_1fr_1fr_160px_auto]">
                  <Form.Item {...field} name={[field.name, 'number']} className="!mb-0"><Input placeholder="01." /></Form.Item>
                  <Form.Item {...field} name={[field.name, 'id']} className="!mb-0"><Input placeholder="id" /></Form.Item>
                  <Form.Item {...field} name={[field.name, 'title']} className="!mb-0"><Input placeholder="title" /></Form.Item>
                  <Form.Item {...field} name={[field.name, 'iconKey']} className="!mb-0"><Input placeholder="iconKey" /></Form.Item>
                  <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                </div>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ number: '', id: '', title: '', iconKey: 'file-protect' })}>Thêm section</Button>
            </div>
          )}
        </Form.List>
      </Card>

      <Card title="01. Giới thiệu chung" className="!rounded-lg !border-zinc-200">
        <Form.List name={['privacy', 'introParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn giới thiệu" />}
        </Form.List>
      </Card>

      <Card title="02. Dữ liệu thu thập" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['privacy', 'collectedDataIntro']} label="Mô tả mở đầu"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['privacy', 'dataItems']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm dữ liệu" />}
        </Form.List>
      </Card>

      <Card title="03. Mục đích sử dụng" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['privacy', 'usagePurposeIntro']} label="Mô tả mở đầu"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['privacy', 'purposeItems']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm mục đích" />}
        </Form.List>
      </Card>

      <Card title="04-07. Nội dung còn lại" className="!rounded-lg !border-zinc-200">
        <Form.List name={['privacy', 'securityParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Cam kết bảo mật - đoạn văn" />}
        </Form.List>
        <Form.Item name={['privacy', 'securityHighlight']} label="Cam kết bảo mật - đoạn nhấn"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name={['privacy', 'userRightsIntro']} label="Quyền người dùng - mở đầu"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['privacy', 'userRights']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Danh sách quyền" />}
        </Form.List>
        <Form.List name={['privacy', 'updatesParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Cập nhật chính sách" />}
        </Form.List>
        <Form.Item name={['privacy', 'contactIntro']} label="Liên hệ - mở đầu"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['privacy', 'contactMethods']}>
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              <Text strong>Phương thức liên hệ</Text>
              {fields.map((field) => (
                <div key={field.key} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                  <Form.Item {...field} name={[field.name, 'iconKey']} className="!mb-0"><Input placeholder="mail/phone" /></Form.Item>
                  <Form.Item {...field} name={[field.name, 'text']} className="!mb-0"><Input placeholder="text" /></Form.Item>
                  <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                </div>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'mail', text: '' })}>Thêm liên hệ</Button>
            </div>
          )}
        </Form.List>
      </Card>
    </div>
  )
}

function TermsResourceForm() {
  return (
    <div className="flex flex-col gap-8">
      <Card title="Hero & sidebar" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true }]}><Input /></Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['terms', 'hero', 'eyebrow']} label="Nhãn cập nhật"><Input /></Form.Item>
          <Form.Item name={['terms', 'hero', 'backgroundImage']} label="Ảnh nền"><Input /></Form.Item>
        </div>
        <Form.Item name={['terms', 'hero', 'title']} label="Tiêu đề"><Input /></Form.Item>
        <Form.Item name={['terms', 'hero', 'subtitle']} label="Phụ đề"><Input /></Form.Item>
        <Form.Item name={['terms', 'tocTitle']} label="Tiêu đề mục lục"><Input /></Form.Item>
        <Form.Item name={['terms', 'supportTitle']} label="Tiêu đề box hỗ trợ"><Input /></Form.Item>
        <Form.Item name={['terms', 'supportText']} label="Mô tả box hỗ trợ"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name={['terms', 'supportButtonLabel']} label="Nút hỗ trợ"><Input /></Form.Item>
        <Form.Item name={['terms', 'contentMoreLabel']} label="Nút xem thêm"><Input /></Form.Item>
      </Card>

      <Card title="Danh sách section" className="!rounded-lg !border-zinc-200">
        <Form.List name={['terms', 'sections']}>
          {(fields, { add, remove }) => <EditableSectionList fields={fields} add={add} remove={remove} />}
        </Form.List>
      </Card>

      <Card title="01. Chấp thuận điều khoản" className="!rounded-lg !border-zinc-200">
        <Form.List name={['terms', 'acceptanceParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Các đoạn nội dung" />}
        </Form.List>
        <Form.Item name={['terms', 'acceptanceNoticeTitle']} label="Tiêu đề lưu ý"><Input /></Form.Item>
        <Form.Item name={['terms', 'acceptanceNotice']} label="Nội dung lưu ý"><Input.TextArea rows={3} /></Form.Item>
      </Card>

      <Card title="02-03. Quy định sử dụng & tài khoản" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['terms', 'serviceRulesIntro']} label="Mở đầu quy định sử dụng"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['terms', 'serviceRules']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Quy định sử dụng" />}
        </Form.List>
        <Form.List name={['terms', 'accountItems']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Tài khoản người dùng" />}
        </Form.List>
      </Card>

      <Card title="04-05. Đặt bàn & thanh toán" className="!rounded-lg !border-zinc-200">
        <Form.List name={['terms', 'bookingCards']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm card đặt bàn" />}
        </Form.List>
        <Form.List name={['terms', 'paymentCards']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm card thanh toán" />}
        </Form.List>
      </Card>

      <Card title="06. Quyền & trách nhiệm" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Form.Item name={['terms', 'responsibilities', 'restaurant', 'title']} label="Tiêu đề Sakura"><Input /></Form.Item>
            <Form.List name={['terms', 'responsibilities', 'restaurant', 'items']}>
              {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Nội dung Sakura" />}
            </Form.List>
          </div>
          <div>
            <Form.Item name={['terms', 'responsibilities', 'user', 'title']} label="Tiêu đề người dùng"><Input /></Form.Item>
            <Form.List name={['terms', 'responsibilities', 'user', 'items']}>
              {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Nội dung người dùng" />}
            </Form.List>
          </div>
        </div>
      </Card>

      <Card title="07-11. Nội dung còn lại" className="!rounded-lg !border-zinc-200">
        <Form.List name={['terms', 'contentParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Nội dung người dùng" />}
        </Form.List>
        <Form.List name={['terms', 'limitationItems']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Giới hạn trách nhiệm" />}
        </Form.List>
        <Form.List name={['terms', 'changesParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Thay đổi điều khoản" />}
        </Form.List>
        <Form.List name={['terms', 'terminationParagraphs']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Chấm dứt dịch vụ" />}
        </Form.List>
        <Form.Item name={['terms', 'contactIntro']} label="Liên hệ - mở đầu"><Input.TextArea rows={2} /></Form.Item>
        <Form.List name={['terms', 'contactMethods']}>
          {(fields, { add, remove }) => <EditableContactMethodList fields={fields} add={add} remove={remove} />}
        </Form.List>
      </Card>
    </div>
  )
}

function CareerResourceForm() {
  return (
    <div className="flex flex-col gap-8">
      <Card title="Hero" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name={['career', 'hero', 'eyebrow']} label="Nhãn nhỏ"><Input /></Form.Item>
        <Form.Item name={['career', 'hero', 'title']} label="Tiêu đề"><Input /></Form.Item>
        <Form.Item name={['career', 'hero', 'subtitle']} label="Phụ đề"><Input /></Form.Item>
        <Form.Item name={['career', 'hero', 'description']} label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name={['career', 'hero', 'backgroundImage']} label="Ảnh nền"><Input /></Form.Item>
      </Card>

      <Card title="Text giao diện & cách thức ứng tuyển" className="!rounded-lg !border-zinc-200">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['jobsTitle', 'Tiêu đề danh sách việc'],
            ['jobsDescription', 'Mô tả danh sách việc'],
            ['showAllJobsLabel', 'Nút xem tất cả'],
            ['collapseJobsLabel', 'Nút thu gọn'],
            ['applyButtonLabel', 'Nút ứng tuyển card lớn'],
            ['compactApplyButtonLabel', 'Nút ứng tuyển card nhỏ'],
            ['jobDescriptionLabel', 'Nhãn mô tả công việc'],
            ['jobRequirementsLabel', 'Nhãn yêu cầu'],
            ['jobBenefitsLabel', 'Nhãn quyền lợi'],
            ['hotlineLabel', 'Nhãn hotline'],
            ['applicationSuccessMessage', 'Thông báo thành công'],
            ['applicationErrorMessage', 'Thông báo thất bại'],
            ['modalEyebrow', 'Modal eyebrow'],
            ['modalFallbackTitle', 'Modal fallback title'],
            ['personalInfoTitle', 'Tiêu đề thông tin cá nhân'],
            ['applicationInfoTitle', 'Tiêu đề thông tin ứng tuyển'],
            ['applicationFilesTitle', 'Tiêu đề hồ sơ'],
            ['coverLetterTitle', 'Tiêu đề thư ngỏ'],
            ['noteTitle', 'Tiêu đề lưu ý'],
            ['dragUploadText', 'Text kéo thả file'],
            ['chooseFileLabel', 'Nút chọn file'],
            ['submitApplicationLabel', 'Nút gửi form'],
          ].map(([key, label]) => (
            <Form.Item key={key} name={['career', 'ui', key]} label={label}>
              <Input.TextArea rows={key.includes('Description') || key.includes('Message') ? 2 : 1} />
            </Form.Item>
          ))}
        </div>
        <Form.Item name={['career', 'application', 'title']} label="Tiêu đề cách thức ứng tuyển"><Input /></Form.Item>
        <Form.Item name={['career', 'application', 'description']} label="Mô tả cách thức ứng tuyển"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name={['career', 'application', 'subjectFormat']} label="Cú pháp subject"><Input /></Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['career', 'application', 'email']} label="Email"><Input /></Form.Item>
          <Form.Item name={['career', 'application', 'hotline']} label="Hotline"><Input /></Form.Item>
        </div>
        <Form.Item name={['career', 'application', 'privacyNote']} label="Lưu ý quyền riêng tư"><Input.TextArea rows={3} /></Form.Item>
      </Card>

      <Card title="Vị trí nổi bật" className="!rounded-lg !border-zinc-200">
        <Form.List name={['career', 'featuredJobs']}>
          {(fields, { add, remove }) => <EditableFeaturedJobList fields={fields} add={add} remove={remove} />}
        </Form.List>
      </Card>

      <Card title="Vị trí mở rộng" className="!rounded-lg !border-zinc-200">
        <Form.List name={['career', 'extraJobs']}>
          {(fields, { add, remove }) => <EditableExtraJobList fields={fields} add={add} remove={remove} />}
        </Form.List>
      </Card>

      <Card title="Form ứng tuyển" className="!rounded-lg !border-zinc-200">
        <Form.List name={['career', 'applicationForm', 'nationalityOptions']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Quốc tịch" />}
        </Form.List>
        <Form.List name={['career', 'applicationForm', 'experienceOptions']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Kinh nghiệm" />}
        </Form.List>
        <Form.List name={['career', 'applicationForm', 'referralOptions']}>
          {(fields, { add, remove }) => <EditableList fields={fields} add={add} remove={remove} label="Nguồn biết đến" />}
        </Form.List>
        <Form.Item name={['career', 'applicationForm', 'uploadFormats']} label="Định dạng upload"><Input /></Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          {['fullName', 'email', 'phone', 'birthDate', 'address', 'nationality', 'linkedIn', 'position', 'workType', 'experience', 'expectedSalary', 'availableStartDate', 'referralSource', 'resume', 'introductionLetter', 'coverLetter'].map((key) => (
            <Card key={key} size="small" title={key} className="!rounded-lg">
              <Form.Item name={['career', 'applicationForm', 'fields', key, 'label']} label="Label"><Input /></Form.Item>
              <Form.Item name={['career', 'applicationForm', 'fields', key, 'placeholder']} label="Placeholder"><Input /></Form.Item>
              <Form.Item name={['career', 'applicationForm', 'fields', key, 'requiredMessage']} label="Required message"><Input /></Form.Item>
              {key === 'email' ? <Form.Item name={['career', 'applicationForm', 'fields', key, 'invalidMessage']} label="Invalid email message"><Input /></Form.Item> : null}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}

function PressKitResourceForm() {
  return (
    <div className="flex flex-col gap-8">
      <Card title="Hero" className="!rounded-lg !border-zinc-200">
        <Form.Item name="label" label="Tên trang trong admin" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name={['pressKit', 'hero', 'eyebrow']} label="Nhãn nhỏ"><Input /></Form.Item>
        <Form.Item name={['pressKit', 'hero', 'title']} label="Tiêu đề"><Input /></Form.Item>
        <Form.Item name={['pressKit', 'hero', 'subtitle']} label="Phụ đề"><Input /></Form.Item>
        <Form.Item name={['pressKit', 'hero', 'description']} label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name={['pressKit', 'hero', 'backgroundImage']} label="Ảnh nền"><Input /></Form.Item>
      </Card>

      <Card title="Overview cards" className="!rounded-lg !border-zinc-200">
        <Form.List name={['pressKit', 'overviewCards']}>
          {(fields, { add, remove }) => <EditablePressCardList fields={fields} add={add} remove={remove} />}
        </Form.List>
      </Card>

      <Card title="Tài sản thương hiệu" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['pressKit', 'brandAssetsSection', 'title']} label="Tiêu đề section"><Input /></Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['pressKit', 'brandAssetsSection', 'logoHeading']} label="Tiêu đề logo"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'brandAssetsSection', 'logoDescription']} label="Mô tả logo"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'brandAssetsSection', 'mediaHeading']} label="Tiêu đề hình ảnh"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'brandAssetsSection', 'mediaDescription']} label="Mô tả hình ảnh"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'brandAssetsSection', 'mediaActionLabel']} label="Nút tải bộ ảnh"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'brandAssetsSection', 'usageHeading']} label="Tiêu đề hướng dẫn"><Input /></Form.Item>
        </div>
        <Form.List name={['pressKit', 'logoAssets']}>
          {(fields, { add, remove }) => <EditableLogoAssetList fields={fields} add={add} remove={remove} />}
        </Form.List>
        <Form.List name={['pressKit', 'mediaAssets']}>
          {(fields, { add, remove }) => <EditableMediaAssetList fields={fields} add={add} remove={remove} />}
        </Form.List>
        <Form.List name={['pressKit', 'usageGuides']}>
          {(fields, { add, remove }) => <EditableCardList fields={fields} add={add} remove={remove} addLabel="Thêm hướng dẫn" />}
        </Form.List>
      </Card>

      <Card title="CTA & liên hệ truyền thông" className="!rounded-lg !border-zinc-200">
        <Form.Item name={['pressKit', 'contactCta', 'title']} label="Tiêu đề CTA"><Input /></Form.Item>
        <Form.Item name={['pressKit', 'contactCta', 'description']} label="Mô tả CTA"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name={['pressKit', 'contactCta', 'actionLabel']} label="Nút CTA"><Input /></Form.Item>
        <Form.Item name={['pressKit', 'contactCta', 'backgroundImage']} label="Ảnh nền CTA"><Input /></Form.Item>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name={['pressKit', 'mediaContactLabels', 'representative']} label="Label đại diện"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'mediaContact', 'representative']} label="Đại diện"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'mediaContactLabels', 'email']} label="Label email"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'mediaContact', 'email']} label="Email"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'mediaContactLabels', 'hotline']} label="Label hotline"><Input /></Form.Item>
          <Form.Item name={['pressKit', 'mediaContact', 'hotline']} label="Hotline"><Input /></Form.Item>
        </div>
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

function EditableSectionList({ fields, add, remove }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="grid gap-3 md:grid-cols-[90px_1fr_1fr_160px_auto]">
          <Form.Item {...field} name={[field.name, 'number']} className="!mb-0"><Input placeholder="01." /></Form.Item>
          <Form.Item {...field} name={[field.name, 'id']} className="!mb-0"><Input placeholder="id" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'title']} className="!mb-0"><Input placeholder="title" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'iconKey']} className="!mb-0"><Input placeholder="iconKey" /></Form.Item>
          <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
        </div>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ number: '', id: '', title: '', iconKey: '' })}>Thêm section</Button>
    </div>
  )
}

function EditableContactMethodList({ fields, add, remove }) {
  return (
    <div className="space-y-3">
      <Text strong>Phương thức liên hệ</Text>
      {fields.map((field) => (
        <div key={field.key} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <Form.Item {...field} name={[field.name, 'iconKey']} className="!mb-0"><Input placeholder="mail/phone" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'text']} className="!mb-0"><Input placeholder="text" /></Form.Item>
          <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
        </div>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'mail', text: '' })}>Thêm liên hệ</Button>
    </div>
  )
}

function EditableFeaturedJobList({ fields, add, remove }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]">
            <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'title']} label="Tên vị trí"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'type']} label="Loại hình"><Input /></Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.List name={[field.name, 'highlights']}>
            {(items, ops) => <EditableList fields={items} add={ops.add} remove={ops.remove} label="Mô tả công việc" />}
          </Form.List>
          <Form.List name={[field.name, 'goodFit']}>
            {(items, ops) => <EditableList fields={items} add={ops.add} remove={ops.remove} label="Yêu cầu" />}
          </Form.List>
          <Form.List name={[field.name, 'benefits']}>
            {(items, ops) => <EditableList fields={items} add={ops.add} remove={ops.remove} label="Quyền lợi" />}
          </Form.List>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'customer-service', title: '', type: '', highlights: [], goodFit: [], benefits: [] })}>Thêm vị trí nổi bật</Button>
    </div>
  )
}

function EditableExtraJobList({ fields, add, remove }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="grid gap-3 md:grid-cols-[150px_1fr_1fr_auto]">
            <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'title']} label="Tên vị trí"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'type']} label="Loại hình"><Input /></Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.Item {...field} name={[field.name, 'location']} label="Địa điểm"><Input /></Form.Item>
          <Form.Item {...field} name={[field.name, 'description']} label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: 'shop', title: '', type: '', location: '', description: '' })}>Thêm vị trí mở rộng</Button>
    </div>
  )
}

function EditablePressCardList({ fields, add, remove }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]">
            <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'value']} label="Giá trị lớn"><Input /></Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.Item {...field} name={[field.name, 'text']} label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item {...field} name={[field.name, 'featured']} label="Featured true/false"><Input /></Form.Item>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: '', title: '', text: '', value: '' })}>Thêm overview card</Button>
    </div>
  )
}

function EditableLogoAssetList({ fields, add, remove }) {
  return (
    <div className="mb-5 space-y-3">
      <Text strong>Logo assets</Text>
      {fields.map((field) => (
        <div key={field.key} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_120px_auto]">
          <Form.Item {...field} name={[field.name, 'label']} className="!mb-0"><Input placeholder="Label" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'brandClass']} className="!mb-0"><Input placeholder="brandClass" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'bgClass']} className="!mb-0"><Input placeholder="bgClass" /></Form.Item>
          <Form.Item {...field} name={[field.name, 'format']} className="!mb-0"><Input placeholder="SVG" /></Form.Item>
          <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
        </div>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ label: '', brandClass: '', bgClass: '', format: 'SVG' })}>Thêm logo asset</Button>
    </div>
  )
}

function EditableMediaAssetList({ fields, add, remove }) {
  return (
    <div className="mb-5 space-y-3">
      <Text strong>Media assets</Text>
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
            <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'image']} label="Ảnh"><Input /></Form.Item>
            <Form.Item {...field} name={[field.name, 'format']} label="Format"><Input /></Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.Item {...field} name={[field.name, 'text']} label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ title: '', text: '', image: '', format: 'JPG' })}>Thêm media asset</Button>
    </div>
  )
}

function EditableCardList({ fields, add, remove, addLabel }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <Card key={field.key} size="small" className="!rounded-lg">
          <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
            <Form.Item {...field} name={[field.name, 'iconKey']} label="Icon">
              <Input placeholder="iconKey" />
            </Form.Item>
            <Form.Item {...field} name={[field.name, 'title']} label="Tiêu đề">
              <Input />
            </Form.Item>
            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
          </div>
          <Form.Item {...field} name={[field.name, 'text']} label="Nội dung">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item {...field} name={[field.name, 'action']} label="Nút phụ nếu có">
            <Input />
          </Form.Item>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => add({ iconKey: '', title: '', text: '' })}>
        {addLabel}
      </Button>
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
