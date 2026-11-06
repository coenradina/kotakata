import { createContext, use, useState, type ReactNode } from 'react'
import { initialLang, saveLang, type Lang } from './i18n'

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: 'id', setLang: () => {} })

/** The interface language, shared by every page and remembered on this device. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(() => {
    const l = initialLang()
    document.documentElement.lang = l
    return l
  })
  const setLang = (next: Lang) => {
    set(next)
    saveLang(next)
    document.documentElement.lang = next
  }
  return <LangContext value={{ lang, setLang }}>{children}</LangContext>
}

export const useLang = () => use(LangContext)
