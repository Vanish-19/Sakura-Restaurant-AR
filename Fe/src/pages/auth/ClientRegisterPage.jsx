import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export default function ClientRegisterPage() {
  const navigate = useNavigate()

  const onFinish = (values) => {
    const draft = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('client_register_draft', JSON.stringify(draft))
    message.success('Tao tai khoan thanh cong. Moi dang nhap.')
    navigate('/auth/login')
  }

  return (
    <div className="client-auth-card-wrap client-auth-card-wrap--register">
      <div className="client-auth-form-title">Create Account</div>
      <div className="client-auth-form-subtitle">
        Enter your details to register with the Sakura Restaurant ecosystem.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item label="FULL NAME" name="fullName" rules={[{ required: true, message: 'Please enter full name' }]}>
          <Input placeholder="Minamoto Yoshitsune" />
        </Form.Item>

        <Form.Item label="EMAIL ADDRESS" name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
          <Input placeholder="yoshitsune@zenith.com" />
        </Form.Item>

        <Form.Item label="PHONE NUMBER" name="phone" rules={[{ required: true, message: 'Please enter phone number' }]}>
          <Input placeholder="+81 (03) 1234-5678" />
        </Form.Item>

        <div className="client-auth-form-row">
          <Form.Item label="PASSWORD" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password placeholder="........" />
          </Form.Item>
          <Form.Item label="CONFIRM PASSWORD" name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: 'Please confirm password' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match')); }, }),]}>
            <Input.Password placeholder="........" />
          </Form.Item>
        </div>

        <Button htmlType="submit" type="primary" className="client-auth-submit" icon={<ArrowRightOutlined />} iconPosition="end">
          Create Account
        </Button>
      </Form>

      <div className="client-auth-bottom-text">
        Already have an account? <Link to="/auth/login">Login</Link>
      </div>
    </div>
  )
}
