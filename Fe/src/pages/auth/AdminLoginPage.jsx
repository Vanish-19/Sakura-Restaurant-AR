import { EyeInvisibleOutlined, EyeTwoTone, SafetyCertificateOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import AuthBrand from '../../components/molecules/auth/AuthBrand.jsx'
import { adminLogin } from '../../services/authApi.js'

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      const res = await adminLogin(values.identity, values.password)
      const token = res?.token
      if (token) {
        localStorage.setItem('admin_access_token', token)
      }
      message.success('Admin login successful')
      navigate('/admin/dashboard')
    } catch (error) {
      message.error(error?.message || 'Admin login failed')
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
            <Form.Item label="EMAIL OR USERNAME" name="identity" rules={[{ required: true, message: 'Please enter email or username' }]}>
              <Input placeholder="Enter your credentials" />
            </Form.Item>
            <Form.Item label="PASSWORD" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
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
