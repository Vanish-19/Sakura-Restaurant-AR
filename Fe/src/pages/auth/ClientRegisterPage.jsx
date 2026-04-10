import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Form, Input, notification } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export default function ClientRegisterPage() {
  const navigate = useNavigate()
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)\d{8}$/
  const NAME_REGEX = /^[a-zA-Z\s]{2,60}$/
  const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

  const onFinish = (values) => {
    const draft = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('client_register_draft', JSON.stringify(draft))
    notification.success({
      message: 'Register successful',
      description: 'Account created. Please login to continue.',
      placement: 'topRight',
    })
    navigate('/auth/login')
  }

  return (
    <div className="client-auth-card-wrap client-auth-card-wrap--register">
      <div className="client-auth-form-title">Create Account</div>
      <div className="client-auth-form-subtitle">
        Enter your details to register with the Sakura Restaurant ecosystem.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item
          label="FULL NAME"
          name="fullName"
          rules={[
            { required: true, message: 'Please enter your full name' },
            {
              validator: (_, value) => {
                const text = String(value || '').trim()
                if (!text) return Promise.resolve()
                if (NAME_REGEX.test(text)) return Promise.resolve()
                return Promise.reject(new Error('Name should be 2-60 letters and spaces only'))
              },
            },
          ]}
        >
          <Input placeholder="Minamoto Yoshitsune" />
        </Form.Item>

        <Form.Item
          label="EMAIL"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            {
              validator: (_, value) => {
                const text = String(value || '').trim()
                if (!text) return Promise.resolve()
                if (EMAIL_REGEX.test(text)) return Promise.resolve()
                return Promise.reject(new Error('Email is invalid'))
              },
            },
          ]}
        >
          <Input placeholder="yoshitsune@zenith.com" />
        </Form.Item>

        <Form.Item
          label="PHONE"
          name="phone"
          rules={[
            { required: true, message: 'Please enter phone number' },
            {
              validator: (_, value) => {
                const text = String(value || '').trim()
                if (!text) return Promise.resolve()
                if (PHONE_REGEX.test(text)) return Promise.resolve()
                return Promise.reject(new Error('Phone must be a valid Vietnamese number'))
              },
            },
          ]}
        >
          <Input placeholder="+81 (03) 1234-5678" />
        </Form.Item>

        <div className="client-auth-form-row">
          <Form.Item
            label="PASSWORD"
            name="password"
            rules={[
              { required: true, message: 'Please enter password' },
              {
                validator: (_, value) => {
                  const text = String(value || '')
                  if (!text) return Promise.resolve()
                  if (PASSWORD_COMPLEXITY_REGEX.test(text)) return Promise.resolve()
                  return Promise.reject(new Error('Password must be 8-64 chars with letters and numbers'))
                },
              },
            ]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>
          <Form.Item
            label="CONFIRM PASSWORD"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
          >
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
