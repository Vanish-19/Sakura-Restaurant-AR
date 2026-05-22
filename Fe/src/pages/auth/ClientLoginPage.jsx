import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, notification } from 'antd'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getGoogleOAuthUrl, userLogin } from '../../services/authApi.js'
import { setUserSession } from '../../utils/authSession.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/

export default function ClientLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oauthErrorShownRef = useRef(false)
  const redirectPath = searchParams.get('redirect') || ''
  const hasOAuthError = searchParams.get('oauth') === 'error'
  const registerHref = redirectPath
    ? `/auth/register?redirect=${encodeURIComponent(redirectPath)}`
    : '/auth/register'
  const identityRules = [
    { required: true, message: t('auth.validation.identityRequired') },
    {
      validator: (_, value) => {
        const text = String(value || '').trim()
        if (!text) return Promise.resolve()

        const isEmail = EMAIL_REGEX.test(text)
        const isUsername = USERNAME_REGEX.test(text)

        if (isEmail || isUsername) return Promise.resolve()
        return Promise.reject(new Error(t('auth.validation.identityInvalid')))
      },
    },
  ]
  const passwordRules = [
    { required: true, message: t('auth.validation.passwordRequired') },
    { min: 6, message: t('auth.validation.passwordMin6') },
  ]

  useEffect(() => {
    if (!hasOAuthError || oauthErrorShownRef.current) return
    oauthErrorShownRef.current = true

    notification.error({
      message: t('auth.loginFailed'),
      description: t('auth.loginErrorDescription'),
      placement: 'topRight',
    })
  }, [hasOAuthError, t])

  const onFinish = async (values) => {
    const identity = values.identity?.trim()
    const password = values.password || ''

    try {
      const result = await userLogin(identity, password)
      const accessToken = result?.accessToken || result?.token || ''
      const refreshToken = result?.refreshToken || ''
      const user = result?.user || null

      if (!accessToken || !refreshToken) {
        throw new Error(t('auth.missingToken'))
      }

      setUserSession({ accessToken, refreshToken, user })

      notification.success({
        message: t('auth.loginSuccess'),
        description: t('auth.loginSuccessDescription'),
        placement: 'topRight',
      })

      const redirectTo = searchParams.get('redirect') || '/'
      navigate(redirectTo)
    } catch (error) {
      notification.error({
        message: t('auth.loginFailed'),
        description: error?.message || t('auth.invalidCredentials'),
        placement: 'topRight',
      })
    }
  }

  const onGoogleLogin = () => {
    window.location.assign(getGoogleOAuthUrl(redirectPath || '/'))
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-8 py-10">
      <div className="w-full max-w-[390px]">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.22em] font-bold text-[#b0001a] uppercase mb-3">
            SAKURA RESTAURANT
          </p>
          <h1 className="client-auth-hero__headline font-['Cormorant_Garamond',_serif] font-normal italic text-[clamp(32px,4vw,54px)] leading-[1.08] text-[#2c2c2c] tracking-[0.01em] [text-shadow:0_1px_6px_rgba(255,255,255,0.55)] mb-3">
            <span className="block">{t('auth.clientLoginTitleLine1')}</span>
            <span className="block">{t('auth.clientLoginTitleLine2')}</span>
          </h1>
          <p className="text-sm text-[#6b6b6f]">
            {t('auth.clientLoginSubtitle')}
          </p>
        </div>

        {/* Form */}
        <Form layout="vertical" onFinish={onFinish} className="login-form-tw">
          {/* Identity */}
          <Form.Item
            className="!mb-5"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.emailOrUsername')}
              </label>
              <Form.Item name="identity" rules={identityRules} noStyle>
                <Input
                  placeholder={t('auth.identityPlaceholder')}
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !px-0 !py-2.5 !shadow-none focus:!border-[#b0001a] hover:!border-[#b0001a] transition-colors"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Password */}
          <Form.Item
            className="!mb-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] tracking-[0.16em] font-bold text-[#4b1f1f] uppercase">
                {t('auth.password')}
              </label>
              <Form.Item name="password" rules={passwordRules} noStyle>
                <Input.Password
                  placeholder="••••••••"
                  className="!border-0 !border-b !border-[#ddd] !rounded-none !bg-transparent !px-0 !py-2.5 !shadow-none"
                />
              </Form.Item>
            </div>
          </Form.Item>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mt-1 mb-5">
            <Checkbox className="text-[13px] text-[#5f5f61]">
              {t('auth.rememberMe')}
            </Checkbox>
            <Link
              to="/auth/login"
              className="auth-hover-link text-[12px] font-semibold no-underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            htmlType="submit"
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            className="client-auth-action-btn !w-full !h-[52px] !border-none !rounded-lg !font-bold !text-[15px] !tracking-wide !text-white"
          >
            {t('common.login')}
          </Button>
        </Form>

        {/* Divider */}
        <div className="relative flex items-center my-5">
          <div className="flex-1 h-px bg-[#ebebeb]" />
          <span className="mx-3 text-[10px] tracking-[0.2em] text-[#a8a8ad] uppercase font-medium">
            {t('auth.orContinueWith')}
          </span>
          <div className="flex-1 h-px bg-[#ebebeb]" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <button
            type="button"
            onClick={onGoogleLogin}
            className="h-10 border border-[#e5e5e5] rounded-lg bg-white text-[#444] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:border-[#d5b0b5] hover:text-[#900020] hover:bg-[#fff8f8] flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="h-10 border border-[#e5e5e5] rounded-lg bg-white text-[#444] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:border-[#d5b0b5] hover:text-[#900020] hover:bg-[#fff8f8] flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Bottom links */}
        <div className="space-y-2 text-center">
          <p className="text-[13px] text-[#5f5f61]">
            {t('auth.noAccount')}{' '}
            <Link
              to={registerHref}
              className="auth-hover-link font-bold no-underline"
            >
              {t('auth.registerNow')}
            </Link>
          </p>
          <p className="text-[12px] text-[#a0a0a5]">
            <Link
              to="/"
              className="auth-hover-link auth-hover-link--muted font-semibold no-underline"
            >
              {t('auth.backHome')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
