import { useEffect, useState } from 'react'

export const SITE_SETTINGS_KEY = 'armenuweb_admin_settings_v1'

export const defaultSiteSettings = {
  websiteName: 'ZenithCrimson',
  clientWebsiteName: 'Sakura Restaurant',
  clientTagline: 'Premium Japanese AR Dining',
  footerPrimary: '© 2026 Sakura Restaurant. Experience Japanese cuisine in AR/VR.',
  footerSecondary: 'さくらレストラン - AR/VRで日本料理を体験',
  themePreset: 'default',
  accentColor: '#c10017',
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getSiteSettings() {
  if (typeof window === 'undefined') return defaultSiteSettings

  try {
    const raw = window.localStorage.getItem(SITE_SETTINGS_KEY)
    if (!raw) return defaultSiteSettings
    const parsed = safeParse(raw)
    return {
      ...defaultSiteSettings,
      ...(parsed || {}),
    }
  } catch {
    return defaultSiteSettings
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => getSiteSettings())

  useEffect(() => {
    const sync = () => setSettings(getSiteSettings())

    window.addEventListener('storage', sync)
    window.addEventListener('site-settings-updated', sync)

    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('site-settings-updated', sync)
    }
  }, [])

  return settings
}
