export function getLocaleFromLanguage(language) {
  const base = (language || '').split('-')[0]
  if (base === 'en') return 'en-GB'
  return 'sq-AL'
}

