import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, notification } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { userLogin } from '../../services/authApi.js'
import { setUserSession } from '../../utils/authSession.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/

const identityRules = [
  { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập' },
  {
    validator: (_, value) => {
      const text = String(value || '').trim()
      if (!text) return Promise.resolve()

      const isEmail = EMAIL_REGEX.test(text)
      const isUsername = USERNAME_REGEX.test(text)

      if (isEmail || isUsername) return Promise.resolve()
      return Promise.reject(new Error('Email hoặc tên đăng nhập không hợp lệ (3-32 ký tự)'))
    },
  },
]

const passwordRules = [
  { required: true, message: 'Vui lòng nhập mật khẩu' },
  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
]

export default function ClientLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || ''
  const registerHref = redirectPath
    ? `/auth/register?redirect=${encodeURIComponent(redirectPath)}`
    : '/auth/register'

  const onFinish = async (values) => {
    const identity = values.identity?.trim()
    const password = values.password || ''

    try {
      const result = await userLogin(identity, password)
      const accessToken = result?.accessToken || result?.token || ''
      const refreshToken = result?.refreshToken || ''
      const user = result?.user || null

      if (!accessToken || !refreshToken) {
        throw new Error('Thiếu thông tin token từ máy chủ')
      }

      setUserSession({ accessToken, refreshToken, user })

      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay lại Sakura Restaurant.',
        placement: 'topRight',
      })

      const redirectPath = searchParams.get('redirect') || '/'
      navigate(redirectPath)
    } catch (error) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error?.message || 'Sai tài khoản hoặc mật khẩu.',
        placement: 'topRight',
      })
    }
  }

  return (
    <div className="client-auth-card-wrap">
      <div className="client-auth-form-title">Chào mừng quay lại</div>
      <div className="client-auth-form-subtitle">
        Khám phá tinh hoa ẩm thực Nhật Bản.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item label="EMAIL HOẶC TÊN ĐĂNG NHẬP" name="identity" rules={identityRules}>
          <Input placeholder="Nhập thông tin đăng nhập" />
        </Form.Item>

        <Form.Item label="MẬT KHẨU" name="password" rules={passwordRules}>
          <Input.Password placeholder="........" />
        </Form.Item>

        <div className="client-auth-inline-row">
          <Checkbox className="client-auth-checkbox">Ghi nhớ đăng nhập</Checkbox>
          <Link className="client-auth-link-muted" to="/auth/login">
            Quên mật khẩu?
          </Link>
        </div>

        <Button htmlType="submit" type="primary" className="client-auth-submit" icon={<ArrowRightOutlined />} iconPosition="end">
          Đăng nhập
        </Button>
      </Form>

      <div className="client-auth-divider">HOẶC TIẾP TỤC VỚI</div>
      <div className="client-auth-social-row">
        <button type="button" className="client-auth-social-btn">Google</button>
        <button type="button" className="client-auth-social-btn">Facebook</button>
      </div>

      <div className="client-auth-bottom-text">
        Chưa có tài khoản? <Link to={registerHref}>Đăng ký ngay</Link>
      </div>

      <div className="client-auth-bottom-text client-auth-bottom-text--alt">
        Ăn tại chỗ? <Link to="/order">Vào thẳng trang gọi món</Link>
      </div>
    </div>
  )
}
