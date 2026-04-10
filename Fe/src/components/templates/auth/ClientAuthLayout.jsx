import { Outlet, useLocation } from 'react-router-dom'
import ClientAuthHero from '../../organisms/auth/ClientAuthHero.jsx'

export default function ClientAuthLayout() {
  const location = useLocation()
  const mode = location.pathname.endsWith('/register') ? 'register' : 'login'

  return (
    <div className="client-auth-layout">
      <div className={`client-auth-shell client-auth-shell--${mode}`}>
        <div key={`hero-${mode}`} className="auth-animated auth-animated--left">
          <ClientAuthHero mode={mode} />
        </div>

        <main className={`client-auth-main client-auth-main--${mode}`}>
          <div key={`form-${mode}`} className="auth-animated auth-animated--right">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
