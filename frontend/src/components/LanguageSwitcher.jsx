import { useTranslation } from 'react-i18next'

const ALBANIA_FLAG_URL = 'https://upload.wikimedia.org/wikipedia/commons/3/36/Flag_of_Albania.svg'
const UK_FLAG_URL = 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg'

const LANGS = [
  { code: 'sq', label: 'Shqip', flagSrc: ALBANIA_FLAG_URL },
  { code: 'en', label: 'English', flagSrc: UK_FLAG_URL },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage || i18n.language || 'sq').split('-')[0]

  return (
    <div style={wrapStyle} role="group" aria-label="Language switcher">
      {LANGS.map(({ code, label, flagSrc }) => {
        const active = current === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            style={{ ...btnStyle, ...(active ? btnActiveStyle : null) }}
          >
            <img src={flagSrc} alt="" style={flagStyle} />
          </button>
        )
      })}
    </div>
  )
}

const wrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const btnStyle = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.12)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  padding: 0,
  lineHeight: 1,
  transition: 'transform 0.15s, background 0.15s, border-color 0.15s',
}

const btnActiveStyle = {
  background: 'rgba(255,255,255,0.22)',
  borderColor: 'rgba(255,255,255,0.65)',
  transform: 'translateY(-1px)',
}

const flagStyle = {
  width: 22,
  height: 16,
  display: 'block',
  borderRadius: 3,
  boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
}
