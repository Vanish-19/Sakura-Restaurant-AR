import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, notification } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

function parseSavedAccount() {
  const raw = localStorage.getItem('client_register_draft')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/

const identityRules = [
  { required: true, message: 'Please enter your email or username' },
  {
    validator: (_, value) => {
      const text = String(value || '').trim()
      if (!text) return Promise.resolve()

      const isEmail = EMAIL_REGEX.test(text)
      const isUsername = USERNAME_REGEX.test(text)

      if (isEmail || isUsername) return Promise.resolve()
      return Promise.reject(new Error('Use a valid email or username (3-32 chars)'))
    },
  },
]

const passwordRules = [
  { required: true, message: 'Please enter password' },
  { min: 6, message: 'Password must be at least 6 characters' },
]

export default function ClientLoginPage() {
  const navigate = useNavigate()

  const onFinish = (values) => {
    const savedAccount = parseSavedAccount()
    const identity = values.identity?.trim()
    const password = values.password || ''

    if (savedAccount) {
      const accountMatched =
        identity === savedAccount.email || identity === savedAccount.fullName

      if (!accountMatched) {
        notification.error({
          message: 'Login failed',
          description: 'Wrong account. Please check email/username.',
          placement: 'topRight',
        })
        return
      }

      if (password !== savedAccount.password) {
        notification.error({
          message: 'Login failed',
          description: 'Wrong password. Please try again.',
          placement: 'topRight',
        })
        return
      }
    }

    const payload = {
      emailOrUsername: identity,
      loginAt: new Date().toISOString(),
    }

    localStorage.setItem('client_login_state', JSON.stringify(payload))
    notification.success({
      message: 'Login successful',
      description: 'Welcome back to Sakura Restaurant.',
      placement: 'topRight',
    })
    navigate('/')
  }

  return (
    <div className="client-auth-card-wrap">
      <div className="client-auth-form-title">Welcome Back</div>
      <div className="client-auth-form-subtitle">
        Discover elevated Japanese cuisine.
      </div>

      <Form layout="vertical" onFinish={onFinish} className="client-auth-form">
        <Form.Item label="EMAIL OR USERNAME" name="identity" rules={identityRules}>
          <Input placeholder="Enter your credentials" />
        </Form.Item>

        <Form.Item label="PASSWORD" name="password" rules={passwordRules}>
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
