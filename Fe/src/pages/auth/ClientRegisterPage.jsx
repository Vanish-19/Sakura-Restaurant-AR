import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Form, Input, notification } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { userRegister } from '../../services/authApi.js'
import { setUserSession } from '../../utils/authSession.js'

export default function ClientRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || ''
  const loginHref = redirectPath
    ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
    : '/auth/login'
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)\d{8}$/
  const NAME_REGEX = /^[\p{L}\s]{2,60}$/u
  const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

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

      const redirectPath = searchParams.get('redirect') || '/'
      navigate(redirectPath)
    } catch (error) {
      notification.error({
        message: 'Đăng ký thất bại',
        description: error?.message || 'Hiện chưa thể tạo tài khoản. Vui lòng thử lại.',
        placement: 'topRight',
      })
    }
  }

  return (
    <div className="client-auth-card-wrap client-auth-card-wrap--register">
      <div className="client-auth-form-title">Tạo tài khoản</div>
      <div className="client-auth-form-subtitle">
        Nhập thông tin để đăng ký tài khoản tại Sakura Restaurant.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item
          label="HỌ VÀ TÊN"
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
        >
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="EMAIL"
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
        >
          <Input placeholder="nguyenvana@gmail.com" />
        </Form.Item>

        <Form.Item
          label="SỐ ĐIỆN THOẠI"
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
        >
          <Input placeholder="0987654321" />
        </Form.Item>

        <div className="client-auth-form-row">
          <Form.Item
            label="MẬT KHẨU"
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
          >
            <Input.Password placeholder="Tạo mật khẩu" />
          </Form.Item>
          <Form.Item
            label="XÁC NHẬN MẬT KHẨU"
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
          >
            <Input.Password placeholder="........" />
          </Form.Item>
        </div>

        <Button htmlType="submit" type="primary" className="client-auth-submit" icon={<ArrowRightOutlined />} iconPosition="end">
          Tạo tài khoản
        </Button>
      </Form>

      <div className="client-auth-bottom-text">
        Đã có tài khoản? <Link to={loginHref}>Đăng nhập</Link>
      </div>
    </div>
  )
}
