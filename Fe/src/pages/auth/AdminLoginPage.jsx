import {
  AppstoreOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/authApi.js'
import { setAdminSession } from '../../utils/authSession.js'

const { Paragraph, Text, Title } = Typography

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/

const identityRules = [
  { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập' },
  {
    validator: (_, value) => {
      const text = String(value || '').trim()
      if (!text) return Promise.resolve()
      if (EMAIL_REGEX.test(text) || USERNAME_REGEX.test(text)) return Promise.resolve()
      return Promise.reject(new Error('Email hoặc tên đăng nhập không hợp lệ (3-32 ký tự)'))
    },
  },
]

const passwordRules = [
  { required: true, message: 'Vui lòng nhập mật khẩu' },
  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
]

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      const res = await adminLogin(values.identity, values.password)
      const accessToken = res?.accessToken || res?.token || ''
      const refreshToken = res?.refreshToken || ''
      const admin = res?.admin || null

      if (!accessToken || !refreshToken) {
        throw new Error('Thiếu thông tin token từ máy chủ')
      }

      setAdminSession({ accessToken, refreshToken, admin })
      notification.success({
        message: 'Đăng nhập quản trị thành công',
        description: 'Xác thực thành công, đang chuyển đến trang quản trị.',
        placement: 'topRight',
      })
      navigate('/admin/dashboard')
    } catch (error) {
      const isInvalidCredentials = error?.status === 401 || error?.status === 403

      notification.error({
        message: 'Đăng nhập quản trị thất bại',
        description: isInvalidCredentials
          ? 'Sai tài khoản hoặc mật khẩu.'
          : error?.message || 'Hiện chưa thể đăng nhập. Vui lòng thử lại.',
        placement: 'topRight',
      })
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f2f2f2] p-2 text-slate-950 md:p-3">
      <div className="mx-auto grid min-h-[calc(100dvh-16px)] max-w-[1180px] overflow-hidden rounded-2xl border border-[#e7e7e7] bg-white shadow-[0_18px_48px_rgba(17,24,39,0.08)] md:min-h-[calc(100dvh-24px)] md:grid-cols-[45%_55%]">
        <aside className="relative flex min-h-[360px] flex-col bg-[#f4f4f4] px-6 py-8 md:min-h-0 md:px-14 md:py-16">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-[#ef001b] text-xl text-white shadow-[0_10px_22px_rgba(239,0,27,0.22)]">
              <AppstoreOutlined />
            </span>
            <Text className="!text-2xl !font-extrabold !tracking-tight !text-[#2b2b2d]">
              SakuraAdmin
            </Text>
          </div>

          <div className="flex flex-1 items-center">
            <Card className="!w-full !max-w-[420px] !rounded-lg !border !border-[#eeeeee] !bg-white !shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[#fff0f2] text-[#ef001b]">
                  <SafetyCertificateOutlined />
                </span>
                <Text className="!text-sm !font-extrabold !text-[#58585c]">
                  Xác thực hai lớp
                </Text>
              </div>

              <div className="flex gap-5 rounded-sm bg-[#fafafa] px-6 py-5">
                <span className="mt-1 text-2xl text-[#ef001b]">
                  <LockOutlined />
                </span>
                <div>
                  <Text className="!block !text-base !font-extrabold !text-[#2f2f32]">
                    Enterprise Security
                  </Text>
                  <Paragraph className="!mb-0 !mt-2 !text-sm !leading-6 !text-[#6a6a70]">
                    Sakura Admin employs strict Two-Factor Authentication (2FA) and end-to-end encryption protocols to ensure the integrity of your restaurant's data environment.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-3 pb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#77777c]">
            <span className="h-2 w-2 rounded-full bg-[#ef001b]" />
            Trạng thái bảo mật đang hoạt động
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 md:px-16 lg:px-24">
          <div className="w-full max-w-[470px]">
            <Title level={1} className="!mb-2 !text-4xl !font-extrabold !tracking-tight !text-[#2c2c2f] md:!text-[42px]">
              Đăng nhập quản trị
            </Title>
            <Paragraph className="!mb-12 !text-base !font-medium !text-[#77777c]">
              Truy cập hệ thống vận hành và quản lý nhà hàng
            </Paragraph>

            <Form layout="vertical" onFinish={onFinish} className="admin-login-form-modern">
              <Form.Item label="EMAIL HOẶC TÊN ĐĂNG NHẬP" name="identity" rules={identityRules}>
                <Input placeholder="Nhập thông tin đăng nhập" />
              </Form.Item>

              <Form.Item label="MẬT KHẨU" name="password" rules={passwordRules}>
                <Input.Password
                  iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#ef001b" /> : <EyeInvisibleOutlined />)}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                className="!h-16 !w-full !rounded !border-0 !bg-[#ef001b] !text-base !font-extrabold !shadow-none transition-all duration-200 hover:!-translate-y-0.5 hover:!bg-[#d90019] hover:!shadow-[0_16px_30px_rgba(239,0,27,0.2)]"
              >
                Đăng nhập
              </Button>
            </Form>
          </div>
        </main>
      </div>
    </div>
  )
}
