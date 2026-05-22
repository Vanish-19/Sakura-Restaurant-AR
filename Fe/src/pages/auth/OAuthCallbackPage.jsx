import { useEffect, useRef } from 'react'
import { Spin, notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { setUserSession } from '../../utils/authSession.js'

function readOAuthParams() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  return new URLSearchParams(hash || window.location.search.slice(1))
}

function readUserProfile(rawValue) {
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

function sanitizeRedirect(value) {
  const text = String(value || '/').trim()
  if (!text || !text.startsWith('/') || text.startsWith('//') || text.includes('\\')) {
    return '/'
  }
  return text
}

export default function OAuthCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const params = readOAuthParams()
    const accessToken = params.get('accessToken') || params.get('token') || ''
    const refreshToken = params.get('refreshToken') || ''
    const user = readUserProfile(params.get('user'))
    const redirectTo = sanitizeRedirect(params.get('redirect'))

    if (!accessToken || !refreshToken || !user) {
      notification.error({
        message: t('auth.loginFailed'),
        description: t('auth.loginErrorDescription'),
        placement: 'topRight',
      })
      navigate('/auth/login?oauth=error', { replace: true })
      return
    }

    setUserSession({ accessToken, refreshToken, user })
    notification.success({
      message: t('auth.loginSuccess'),
      description: t('auth.loginSuccessDescription'),
      placement: 'topRight',
    })
    navigate(redirectTo, { replace: true })
  }, [navigate, t])

  return (
    <div className="w-full h-full flex items-center justify-center px-8 py-10">
      <Spin size="large" />
    </div>
  )
}
