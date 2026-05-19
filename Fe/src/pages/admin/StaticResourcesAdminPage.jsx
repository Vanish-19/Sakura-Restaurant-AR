import { SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Tabs, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx';
import { getAdminStaticPages, updateAdminStaticPage } from '../../services/staticPageApi.js';

const { Paragraph, Text } = Typography;

const pageOrder = [
  'about',
  'contact',
  'privacy-policy',
  'terms-of-service',
  'career',
  'press-kit',
];

const pageLabels = {
  about: 'About',
  contact: 'Contact',
  'privacy-policy': 'Privacy & Policy',
  'terms-of-service': 'Terms Of Service',
  career: 'Careers',
  'press-kit': 'Press Kit',
};

function stringifyContent(content) {
  return JSON.stringify(content || {}, null, 2);
}

function parseJson(value) {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return null;
  }
}

export default function StaticResourcesAdminPage() {
  const [form] = Form.useForm();
  const [pages, setPages] = useState([]);
  const [activeSlug, setActiveSlug] = useState(pageOrder[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hydrateForm = useCallback((page) => {
    const content = page?.content || {};
    form.setFieldsValue({
      label: page?.label || pageLabels[activeSlug],
      heroEyebrow: content.hero?.eyebrow,
      heroTitle: content.hero?.title,
      heroAccent: content.hero?.accent,
      heroSubtitle: content.hero?.subtitle,
      heroDescription: content.hero?.description,
      heroBackgroundImage: content.hero?.backgroundImage,
      contentJson: stringifyContent(content),
    });
  }, [activeSlug, form]);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminStaticPages();
      const data = response?.data || [];
      const sorted = [...data].sort((a, b) => pageOrder.indexOf(a.slug) - pageOrder.indexOf(b.slug));
      setPages(sorted);
      hydrateForm(sorted.find((page) => page.slug === activeSlug) || sorted[0]);
    } catch (error) {
      message.error(error?.message || 'Không thể tải dữ liệu trang static');
    } finally {
      setLoading(false);
    }
  }, [activeSlug, hydrateForm]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleTabChange = (slug) => {
    setActiveSlug(slug);
    const page = pages.find((item) => item.slug === slug);
    hydrateForm(page);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const parsedContent = parseJson(values.contentJson);

      if (!parsedContent) {
        message.error('JSON nội dung mở rộng không hợp lệ');
        return;
      }

      const content = {
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
      };

      setSaving(true);
      const response = await updateAdminStaticPage(activeSlug, {
        label: values.label,
        content,
      });

      setPages((current) =>
        current.map((page) => (page.slug === activeSlug ? response.data : page))
      );
      hydrateForm(response.data);
      message.success('Đã lưu tài nguyên trang static');
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.message || 'Lưu tài nguyên thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Static resources"
        title="Quản lý tài nguyên"
        subtitle="Quản lý nội dung hiển thị cho About, Contact, Privacy, Terms, Careers và Press Kit. Dữ liệu được lưu trong MongoDB để admin và client dùng chung."
        action={
          <Button
            type="primary"
            className="admin-primary-btn"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Lưu thay đổi
          </Button>
        }
      />

      <Card className="admin-panel-card" loading={loading}>
        <Tabs
          activeKey={activeSlug}
          onChange={handleTabChange}
          items={pageOrder.map((slug) => ({
            key: slug,
            label: pageLabels[slug],
          }))}
        />

        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <Card title="Thông tin hero" className="!rounded-lg !border-zinc-200">
              <Form.Item
                name="label"
                label="Tên trang trong admin"
                rules={[{ required: true, message: 'Vui lòng nhập tên trang' }]}
              >
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
                Dùng phần này để lưu các nhóm dữ liệu riêng của từng trang như email ứng tuyển,
                contact truyền thông, danh sách card hoặc text phụ. Trường <Text strong>hero</Text> sẽ
                được đồng bộ với form bên trái khi lưu.
              </Paragraph>
              <Form.Item
                name="contentJson"
                rules={[
                  {
                    validator: (_, value) =>
                      parseJson(value) ? Promise.resolve() : Promise.reject(new Error('JSON không hợp lệ')),
                  },
                ]}
              >
                <Input.TextArea rows={24} className="!font-mono !text-xs" spellCheck={false} />
              </Form.Item>
            </Card>
          </div>
        </Form>
      </Card>
    </div>
  );
}
