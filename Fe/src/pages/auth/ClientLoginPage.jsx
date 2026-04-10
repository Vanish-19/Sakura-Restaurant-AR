import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export default function ClientLoginPage() {
  const navigate = useNavigate()

  const onFinish = (values) => {
    const payload = {
      emailOrUsername: values.identity,
      loginAt: new Date().toISOString(),
    }

    localStorage.setItem('client_login_state', JSON.stringify(payload))
    message.success('Dang nhap thanh cong')
    navigate('/')
  }

  return (
    <div className="client-auth-card-wrap">
      <div className="client-auth-form-title">Welcome Back</div>
      <div className="client-auth-form-subtitle">
        Discover elevated Japanese cuisine.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item label="EMAIL OR USERNAME" name="identity" rules={[{ required: true, message: 'Please enter your email or username' }]}>
          <Input placeholder="Enter your credentials" />
        </Form.Item>

        <Form.Item label="PASSWORD" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
          <Input.Password placeholder="........" />
        </Form.Item>

        <div className="client-auth-inline-row">
          <Checkbox className="client-auth-checkbox">Remember me</Checkbox>
          <Link className="client-auth-link-muted" to="/auth/login">
            Forgot password?
          </Link>
        </div>

        <Button htmlType="submit" type="primary" className="client-auth-submit" icon={<ArrowRightOutlined />} iconPosition="end">
          Sign In
        </Button>
      </Form>

      <div className="client-auth-divider">CONTINUE WITH</div>
      <div className="client-auth-social-row">
        <button type="button" className="client-auth-social-btn">Google</button>
        <button type="button" className="client-auth-social-btn">Facebook</button>
      </div>

      <div className="client-auth-bottom-text">
        Don't have an account? <Link to="/auth/register">Reserve Your Seat</Link>
      </div>

      <div className="client-auth-bottom-text client-auth-bottom-text--alt">
        Ăn tại chỗ? <Link to="/order">Skip vào trang chủ</Link>
      </div>
    </div>
  )
}
