import AuthBrand from '../../molecules/auth/AuthBrand.jsx'

const heroContentByMode = {
  login: {
    eyebrow: 'SAKURA RESTAURANT · KYOTO',
    title: 'The Modern\nInkstone',
    description: 'Trải nghiệm quản lý ẩm thực tinh tế,\nkết hợp giữa nghệ thuật và công nghệ.',
    meta: 'EST. 2024',
  },
  register: {
    eyebrow: null,
    title: 'Join the Modern Inkstone',
    description:
    'Trải nghiệm sự tinh tế của chủ nghĩa tối giản Nhật Bản trong quản lý ẩm thực.',
      // 'Experience the precision of Japanese structural minimalism in culinary management.',
    meta: 'EST. 2024',
  },
}

export default function ClientAuthHero({ mode = 'login' }) {
  const content = heroContentByMode[mode] ?? heroContentByMode.login
  const isLogin = mode === 'login'

  return (
    <aside className={`client-auth-hero client-auth-hero--${mode}`}>
      <div className="client-auth-hero__overlay" />

      <div className="client-auth-hero__content">
        {/* Brand nhỏ — góc trên trái */}
        <div className="client-auth-hero__brand-slot">
          <AuthBrand dark={isLogin} mini={isLogin} />
        </div>
        {content.eyebrow && (
            <div className="client-auth-hero__eyebrow"
              style={{
                position: 'absolute',
                top: '60px',
                left: '24px',
                zIndex: 3,
              }}
            >{content.eyebrow}</div>
          )}
        {/* Spacer đẩy nội dung xuống đáy */}
        <div className="client-auth-hero__spacer" />
        
      </div>
      {/* Cụm text chính — sát đáy, TRÊN watermark "LOGIN ENTER" */}
        <div className="client-auth-hero__bottom">
          <h2 className="client-auth-hero__headline">
            {content.title.split('\n').map((line, i) => (
              <span key={i} className="client-auth-hero__headline-line">
                {line}
              </span>
            ))}
          </h2>
          <p className="client-auth-hero__text">
            {content.description.split('\n').map((line, i) => (
              <span key={i} className="client-auth-hero__text-line">
                {line}
              </span>
            ))}
          </p>
          {content.meta && (
            <div className="client-auth-hero__meta">{content.meta}</div>
          )}
        </div>
    </aside>
  )
}
