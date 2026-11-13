import { useEffect, useState, type FormEvent } from 'react'
import { loadChildren, removeChild, saveChild, type ChildProfile } from '../account/client'
import { AVATARS, CHILD_IDS, NICKNAME_MAX, cleanChild } from '../account/schema'
import { Card, Chip, Chips, Field, Page, RequireRole, errorText, inputClass, primaryButton, secondaryButton } from '../account/ui'
import { t } from '../i18n'
import { useLang } from '../lang'
import { Link } from '../router'

/**
 * /ortu: a parent's home, with up to six child profiles
 * (docs/plan/07-accounts-and-classes.md, section 4).
 */
export default function ParentPage() {
  return <RequireRole role="parent">{({ user, profile }) => <Children uid={user.uid} name={profile.displayName} />}</RequireRole>
}

function Children({ uid, name }: { uid: string; name: string }) {
  const { lang } = useLang()
  const [children, setChildren] = useState<ChildProfile[] | null>(null)
  const [editing, setEditing] = useState<ChildProfile | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reload = () =>
    loadChildren(uid)
      .then(setChildren)
      .catch((e) => setError(errorText(e)))
  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const freeId = CHILD_IDS.find((id) => !children?.some((c) => c.id === id))
  const remove = async (c: ChildProfile) => {
    if (!window.confirm(t(lang, 'paRemoveConfirm', { name: c.nickname }))) return
    try {
      await removeChild(uid, c.id)
      await reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <Page title={t(lang, 'paHello', { name })}>
      <p className="type-lead">{t(lang, 'paLead')}</p>
      <Card title={t(lang, 'paChildren', { n: children?.length ?? 0 })}>
        {children === null && !error && <p className="type-body">{t(lang, 'acLoading')}</p>}
        {children?.length === 0 && <p className="type-body">{t(lang, 'paEmpty')}</p>}
        <ul className="space-y-2">
          {children?.map((c) =>
            editing !== 'new' && editing?.id === c.id ? (
              <li key={c.id}>
                <ChildForm
                  initial={c}
                  onCancel={() => setEditing(null)}
                  onSave={async (child) => {
                    await saveChild(uid, c.id, child)
                    setEditing(null)
                    await reload()
                  }}
                />
              </li>
            ) : (
              <li key={c.id} className="flex flex-wrap items-center gap-3 rounded border-2 border-ink bg-cream p-3">
                <span className="type-heading" aria-hidden>
                  {c.avatar}
                </span>
                <span className="flex-1 type-subheading">{c.nickname}</span>
                <button onClick={() => setEditing(c)} className={secondaryButton}>
                  {t(lang, 'paEdit')}
                </button>
                <button onClick={() => remove(c)} className={secondaryButton}>
                  {t(lang, 'paRemove')}
                </button>
              </li>
            ),
          )}
        </ul>
        {editing === 'new' && freeId && (
          <ChildForm
            onCancel={() => setEditing(null)}
            onSave={async (child) => {
              await saveChild(uid, freeId, child)
              setEditing(null)
              await reload()
            }}
          />
        )}
        {children && editing === null && (freeId ? <button onClick={() => setEditing('new')} className={primaryButton}>{t(lang, 'paAdd')}</button> : <p className="type-caption text-ink-muted">{t(lang, 'paFull')}</p>)}
        {error && (
          <p role="alert" className="type-body text-maroon">
            {t(lang, 'acError', { msg: error })}
          </p>
        )}
      </Card>
      <p className="type-caption text-ink-muted">{t(lang, 'paProgressNote')}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/main" className={`${primaryButton} inline-flex items-center`}>
          {t(lang, 'paPlay')}
        </Link>
        <Link to="/akun" className="type-label underline hover:text-maroon">
          {t(lang, 'akTitle')}
        </Link>
      </div>
    </Page>
  )
}

function ChildForm({ initial, onSave, onCancel }: { initial?: ChildProfile; onSave: (c: { nickname: string; avatar: string }) => Promise<void>; onCancel: () => void }) {
  const { lang } = useLang()
  const [nickname, setNickname] = useState(initial?.nickname ?? '')
  const [avatar, setAvatar] = useState<string>(initial?.avatar ?? AVATARS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clean = cleanChild({ nickname, avatar })
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!clean) return
    setBusy(true)
    try {
      await onSave(clean)
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 rounded border-2 border-ink bg-cream p-4">
      <Field label={t(lang, 'paNickname')} required>
        <input value={nickname} maxLength={NICKNAME_MAX} onChange={(e) => setNickname(e.target.value)} className={inputClass} aria-label={t(lang, 'paNickname')} />
      </Field>
      <Field label={t(lang, 'paAvatar')} required>
        <Chips>
          {AVATARS.map((a) => (
            <Chip key={a} type="radio" name="avatar" checked={avatar === a} onChange={() => setAvatar(a)}>
              <span className="type-subheading">{a}</span>
            </Chip>
          ))}
        </Chips>
      </Field>
      {error && (
        <p role="alert" className="type-body text-maroon">
          {t(lang, 'acError', { msg: error })}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={!clean || busy} className={primaryButton}>
          {t(lang, 'paSave')}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          {t(lang, 'paCancel')}
        </button>
      </div>
    </form>
  )
}
