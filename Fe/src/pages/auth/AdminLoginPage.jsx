import { EyeInvisibleOutlined, EyeTwoTone, SafetyCertificateOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import AuthBrand from '../../components/molecules/auth/AuthBrand.jsx'
import { adminLogin } from '../../services/authApi.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/

const identityRules = [
  { required: true, message: 'Please enter email or username' },
  {
    validator: (_, value) => {
      const text = String(value || '').trim()
      if (!text) return Promise.resolve()
      if (EMAIL_REGEX.test(text) || USERNAME_REGEX.test(text)) return Promise.resolve()
      return Promise.reject(new Error('Use a valid email or username (3-32 chars)'))
    },
  },
]

const passwordRules = [
  { required: true, message: 'Please enter password' },
  { min: 8, message: 'Password must be at least 8 characters' },
]

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      const res = await adminLogin(values.identity, values.password)
      const token = res?.token
      if (token) {
        localStorage.setItem('admin_access_token', token)
      }
      notification.success({
        message: 'Admin login successful',
        description: 'Access granted. Redirecting to dashboard.',
        placement: 'topRight',
      })
      navigate('/admin/dashboard')
    } catch (error) {
      const isInvalidCredentials = error?.status === 401 || error?.status === 403

      notification.error({
        message: 'Admin login failed',
        description: isInvalidCredentials
          ? 'Wrong account or password.'
          : error?.message || 'Unable to login right now.',
        placement: 'topRight',
      })
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-center">
        <AuthBrand compact dark />

        <Card className="admin-login-card">
          <h2 className="admin-login-card__title">Admin Portal Login</h2>
          <p className="admin-login-card__subtitle">Access your editorial management terminal</p>

          <Form layout="vertical" onFinish={onFinish} className="admin-login-form">
            <Form.Item label="EMAIL OR USERNAME" name="identity" rules={identityRules}>
              <Input placeholder="Enter your credentials" />
            </Form.Item>
            <Form.Item label="PASSWORD" name="password" rules={passwordRules}>
              <Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} placeholder="........" />
            </Form.Item>

            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="2FA Prompt"
              description="You will be prompted for your hardware key or authenticator code after this step."
              className="admin-login-alert"
            />

            <Button htmlType="submit" type="primary" className="admin-login-submit">
              Secure Login
            </Button>
          </Form>
        </Card>

        <div className="admin-login-footer">
          <span>SYSTEM SECURITY: ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
