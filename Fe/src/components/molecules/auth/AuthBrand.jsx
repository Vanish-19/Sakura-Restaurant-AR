import { AppstoreAddOutlined } from '@ant-design/icons'

export default function AuthBrand({ dark = false, compact = false }) {
  return (
    <div className={compact ? 'auth-brand auth-brand--compact' : 'auth-brand'}>
      <div className={dark ? 'auth-brand__mark auth-brand__mark--dark' : 'auth-brand__mark'}>
        <AppstoreAddOutlined />
      </div>
      <div>
        <div className={dark ? 'auth-brand__title auth-brand__title--dark' : 'auth-brand__title'}>
          {compact ? 'SakuraAdmin' : 'ZENITH CRIMSON'}
        </div>
        {compact ? null : <div className="auth-brand__subtitle">KYOTO PREMIUM</div>}
      </div>
    </div>
  )
}
