import AuthBrand from '../../molecules/auth/AuthBrand.jsx'

const heroContentByMode = {
  login: {
    eyebrow: 'AUTHENTIC EXPERIENCE',
    title: 'The Modern Inkstone of Culinary Art.',
    description: 'Signature precision for editorial culinary operations.',
    meta: 'EST. 1994 TOKYO',
  },
  register: {
    eyebrow: null,
    title: 'Join the Modern Inkstone',
    description:
      'Experience the precision of Japanese structural minimalism in culinary management.',
    meta: 'EST. 2024',
  },
}

export default function ClientAuthHero({ mode = 'login' }) {
  const content = heroContentByMode[mode] ?? heroContentByMode.login

  return (
    <aside className={`client-auth-hero client-auth-hero--${mode}`}>
      <div className="client-auth-hero__overlay" />
      <div className="client-auth-hero__content">
        <AuthBrand />
        {content.eyebrow ? (
          <div className="client-auth-hero__eyebrow">{content.eyebrow}</div>
        ) : null}
        <h2 className="client-auth-hero__headline">{content.title}</h2>
        <p className="client-auth-hero__text">{content.description}</p>
        <div className="client-auth-hero__meta">{content.meta}</div>
      </div>
    </aside>
  )
}
