import { setLocale, type LocaleObject } from 'yup'
import { yupPtBR } from './yup-pt-br'
import { yupEsMX } from './yup-es-mx'
import { yupEnUS } from './yup-en-us'

const locales: Record<string, LocaleObject> = {
  'pt-br': yupPtBR,
  'es-mx': yupEsMX,
  'en-us': yupEnUS,
}

export function setYupLocale(lang: string) {
  setLocale(locales[lang] ?? yupPtBR)
}
