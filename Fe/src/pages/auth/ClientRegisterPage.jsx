import { ArrowRightOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, notification } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { userRegister } from '../../services/authApi.js'
import { setUserSession } from '../../utils/authSession.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)\d{8}$/
const NAME_REGEX = /^[\p{L}\s]{2,60}$/u
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

export default function ClientRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || ''
  const loginHref = redirectPath
    ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
    : '/auth/login'

  const onFinish = async (values) => {
    try {
      const result = await userRegister({
        name: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })

      const accessToken = result?.accessToken || result?.token || ''
      const refreshToken = result?.refreshToken || ''
      const user = result?.user || null

      if (!accessToken || !refreshToken) {
        throw new Error('Thiếu thông tin token từ máy chủ')
      }

      setUserSession({ accessToken, refreshToken, user })

      notification.success({
        message: 'Đăng ký thành công',
        description: 'Tài khoản đã sẵn sàng và bạn đã được đăng nhập.',
        placement: 'topRight',
      })

      const redirectTo = searchParams.get('redirect') || '/'
      navigate(redirectTo)
    } catch (error) {
      notification.error({
        message: 'Đăng ký thất bại',
        description: error?.message || 'Hiện chưa thể tạo tài khoản. Vui lòng thử lại.',
        placement: 'topRight',
      })
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-8 py-6 overflow-y-auto">
      <div className="w-full max-w-[400px]">

        {/* Header */}
        <div className="mb-6">
          <h1
            className="font-['Cormorant_Garamond',_serif] font-normal italic text-[clamp(32px,4vw,50px)] leading-[1.08] text-[#1c1c1e] tracking-[0.01em] mb-2"
          >
            Tạo tài khoản
          </h1>
          <p className="text-sm text-[#6b6b6f] leading-relaxed">
            Nhập thông tin để đăng ký tài khoản tại{' '}
            <span className="text-[#b0001a] font-semibold">Sakura Restaurant</span>.
          </p>
        </div>

        {/* Form */}
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="register-form-tw"
        >
          {/* Họ và tên */}
          <Form.Item
            name="fullName"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              {
                validator: (_, value) => {
                  const text = String(value || '').trim()
                  if (!text) return Promise.resolve()
                  if (NAME_REGEX.test(text)) return Promise.resolve()
                  return Promise.reject(new Error('Tên chỉ gồm chữ cái và khoảng trắng (2-60 ký tự)'))
                },
              },
            ]}
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                Họ và tên
              </label>
              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên' },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (NAME_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error('Tên chỉ gồm chữ cái và khoảng trắng (2-60 ký tự)'))
                    },
                  },
                ]}
                noStyle
              >
                <Input
                  prefix={<UserOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder="Nguyễn Văn A"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none focus:!border-[#b0001a] hover:!border-[#b0001a] transition-colors"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              {
                validator: (_, value) => {
                  const text = String(value || '').trim()
                  if (!text) return Promise.resolve()
                  if (EMAIL_REGEX.test(text)) return Promise.resolve()
                  return Promise.reject(new Error('Email không hợp lệ'))
                },
              },
            ]}
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                Email
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (EMAIL_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error('Email không hợp lệ'))
                    },
                  },
                ]}
                noStyle
              >
                <Input
                  prefix={<MailOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder="example@domain.com"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none focus:!border-[#b0001a] hover:!border-[#b0001a] transition-colors"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="phone"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              {
                validator: (_, value) => {
                  const text = String(value || '').trim()
                  if (!text) return Promise.resolve()
                  if (PHONE_REGEX.test(text)) return Promise.resolve()
                  return Promise.reject(new Error('Số điện thoại Việt Nam không hợp lệ'))
                },
              },
            ]}
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                Số điện thoại
              </label>
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (PHONE_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error('Số điện thoại Việt Nam không hợp lệ'))
                    },
                  },
                ]}
                noStyle
              >
                <Input
                  prefix={<PhoneOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder="0912 345 678"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none focus:!border-[#b0001a] hover:!border-[#b0001a] transition-colors"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              {
                validator: (_, value) => {
                  const text = String(value || '')
                  if (!text) return Promise.resolve()
                  if (PASSWORD_COMPLEXITY_REGEX.test(text)) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu phải từ 8-64 ký tự, gồm chữ và số'))
                },
              },
            ]}
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                Mật khẩu
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  {
                    validator: (_, value) => {
                      const text = String(value || '')
                      if (!text) return Promise.resolve()
                      if (PASSWORD_COMPLEXITY_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error('Mật khẩu phải từ 8-64 ký tự, gồm chữ và số'))
                    },
                  },
                ]}
                noStyle
              >
                <Input.Password
                  prefix={<LockOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder="•••••••"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Xác nhận mật khẩu */}
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            className="!mb-5"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                Xác nhận mật khẩu
              </label>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve()
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                    },
                  }),
                ]}
                noStyle
              >
                <Input.Password
                  prefix={<LockOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder="•••••••"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Submit */}
          <Button
            htmlType="submit"
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            className="!w-full !h-[52px] !bg-gradient-to-r !from-[#af0017] !to-[#d1001f] !border-none !rounded-lg !font-bold !text-[15px] !tracking-wide hover:!shadow-[0_10px_28px_rgba(175,0,23,0.35)] hover:!-translate-y-0.5 transition-all duration-200 !text-white"
          >
            Tạo tài khoản
          </Button>
        </Form>

        {/* Bottom link */}
        <div className="mt-4 text-center">
          <p className="text-[13px] text-[#5f5f61]">
            Đã có tài khoản?{' '}
            <Link
              to={loginHref}
              className="font-bold text-[#b00518] hover:text-[#8a0010] no-underline transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
