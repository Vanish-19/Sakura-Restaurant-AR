import { EyeInvisibleOutlined, EyeTwoTone, SafetyCertificateOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import AuthBrand from '../../components/molecules/auth/AuthBrand.jsx'
import { adminLogin } from '../../services/authApi.js'
import { setAdminSession } from '../../utils/authSession.js'

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
    <div className="admin-login-page">
      <div className="admin-login-center">
        <AuthBrand compact dark />

        <Card className="admin-login-card">
          <h2 className="admin-login-card__title">Đăng nhập quản trị</h2>
          <p className="admin-login-card__subtitle">Truy cập hệ thống vận hành và quản lý nhà hàng</p>

          <Form layout="vertical" onFinish={onFinish} className="admin-login-form">
            <Form.Item label="EMAIL HOẶC TÊN ĐĂNG NHẬP" name="identity" rules={identityRules}>
              <Input placeholder="Nhập thông tin đăng nhập" />
            </Form.Item>
            <Form.Item label="MẬT KHẨU" name="password" rules={passwordRules}>
              <Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} placeholder="........" />
            </Form.Item>

            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="Xác thực hai lớp"
              description="Sau bước này, hệ thống sẽ yêu cầu mã OTP hoặc khóa bảo mật để hoàn tất đăng nhập."
              className="admin-login-alert"
            />

            <Button htmlType="submit" type="primary" className="admin-login-submit">
              Đăng nhập an toàn
            </Button>
          </Form>
        </Card>

        <div className="admin-login-footer">
          <span>TRẠNG THÁI BẢO MẬT: ĐANG HOẠT ĐỘNG</span>
        </div>
      </div>
    </div>
  )
}
