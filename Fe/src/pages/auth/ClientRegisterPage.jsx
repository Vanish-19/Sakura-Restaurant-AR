import { ArrowRightOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { userRegister } from '../../services/authApi.js'
import { setUserSession } from '../../utils/authSession.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)\d{8}$/
const NAME_REGEX = /^[\p{L}\s]{2,60}$/u
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

export default function ClientRegisterPage() {
  const { t } = useTranslation()
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
        throw new Error(t('auth.missingToken'))
      }

      setUserSession({ accessToken, refreshToken, user })

      notification.success({
        message: t('auth.registerSuccess'),
        description: t('auth.registerSuccessDescription'),
        placement: 'topRight',
      })

      const redirectTo = searchParams.get('redirect') || '/'
      navigate(redirectTo)
    } catch (error) {
      notification.error({
        message: t('auth.registerFailed'),
        description: error?.message || t('auth.registerErrorDescription'),
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
            {t('auth.createAccountTitle')}
          </h1>
          <p className="text-sm text-[#6b6b6f] leading-relaxed">
            {t('auth.createAccountSubtitle')}{' '}
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
            className="!mb-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.fullName')}
              </label>
              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: t('auth.validation.fullNameRequired') },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (NAME_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error(t('auth.validation.fullNameInvalid')))
                    },
                  },
                ]}
                noStyle
              >
                <Input
                  prefix={<UserOutlined className="text-[#b0b0b8] text-sm mr-1" />}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !pl-0 !py-2.5 !shadow-none focus:!border-[#b0001a] hover:!border-[#b0001a] transition-colors"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Email */}
          <Form.Item
            className="!mb-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.email')}
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: t('auth.validation.emailRequired') },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (EMAIL_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error(t('auth.validation.emailInvalid')))
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
            className="!mb-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.phone')}
              </label>
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: t('auth.validation.phoneRequired') },
                  {
                    validator: (_, value) => {
                      const text = String(value || '').trim()
                      if (!text) return Promise.resolve()
                      if (PHONE_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error(t('auth.validation.phoneInvalid')))
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
            className="!mb-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.password')}
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: t('auth.validation.passwordRequired') },
                  {
                    validator: (_, value) => {
                      const text = String(value || '')
                      if (!text) return Promise.resolve()
                      if (PASSWORD_COMPLEXITY_REGEX.test(text)) return Promise.resolve()
                      return Promise.reject(new Error(t('auth.validation.passwordComplexity')))
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
            className="!mb-5"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.confirmPassword')}
              </label>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: t('auth.validation.confirmPasswordRequired') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve()
                      return Promise.reject(new Error(t('auth.validation.confirmPasswordMismatch')))
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
            className="client-auth-action-btn !w-full !h-[52px] !border-none !rounded-lg !font-bold !text-[15px] !tracking-wide !text-white"
          >
            {t('auth.createAccountButton')}
          </Button>
        </Form>

        {/* Bottom link */}
        <div className="mt-4 text-center">
          <p className="text-[13px] text-[#5f5f61]">
            {t('auth.hasAccount')}{' '}
            <Link
              to={loginHref}
              className="auth-hover-link font-bold no-underline"
            >
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
