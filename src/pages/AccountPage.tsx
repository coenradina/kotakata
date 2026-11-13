import { useState, type FormEvent } from 'react'
import { useAccount } from '../account/AccountProvider'
import { deleteAccount, signOut, updateProfile } from '../account/client'
import { NAME_MAX } from '../account/schema'
import { Card, Check, Chip, Chips, Field, Page, RequireRole, errorText, inputClass, primaryButton, secondaryButton } from '../account/ui'
import { t } from '../i18n'
import { useLang } from '../lang'
import { Link, useRoute } from '../router'

/** /akun: change the name and choices, sign out, or delete the account. */
export default function AccountPage() {
  const { lang } = useLang()
  const { refresh } = useAccount()
  const { navigate } = useRoute()
  return (
    <RequireRole role="any">
      {({ user, profile }) => (
        <AccountForm
          key={user.uid}
          uid={user.uid}
          email={profile.email ?? user.email}
          role={profile.role}
          initial={{ displayName: profile.displayName, training: profile.training, mailing: profile.mailing.optIn }}
          lang={lang}
          onSaved={refresh}
          onGone={() => navigate('/')}
        />
      )}
    </RequireRole>
  )
}

function AccountForm({
  uid,
  email,
  role,
  initial,
  lang,
  onSaved,
  onGone,
}: {
  uid: string
  email: string | null
  role: 'educator' | 'parent'
  initial: { displayName: string; training: 'yes' | 'no' | null; mailing: boolean }
  lang: 'id' | 'en'
  onSaved: () => Promise<void>
  onGone: () => void
}) {
  const [name, setName] = useState(initial.displayName)
  const [training, setTraining] = useState(initial.training)
  const [mailing, setMailing] = useState(initial.mailing)
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'saved' } | { kind: 'error'; msg: string }>({ kind: 'idle' })

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setState({ kind: 'busy' })
    try {
      await updateProfile(uid, {
        displayName: name.trim().replace(/\s+/g, ' '),
        lang,
        ...(role === 'educator' ? { training } : {}),
        ...(mailing !== initial.mailing ? { mailing } : {}),
      })
      await onSaved()
      setState({ kind: 'saved' })
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) })
    }
  }

  const remove = async () => {
    if (!window.confirm(t(lang, 'akDeleteConfirm'))) return
    setState({ kind: 'busy' })
    try {
      await deleteAccount()
      onGone()
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) })
    }
  }

  return (
    <Page title={t(lang, 'akTitle')}>
      <Link to={role === 'educator' ? '/guru' : '/ortu'} className="inline-block type-label underline hover:text-maroon">
        {t(lang, 'akHome')}
      </Link>
      <form onSubmit={save}>
        <Card>
          <p className="type-body">
            {email} · {t(lang, 'akRole')}: {t(lang, role === 'educator' ? 'roleEducator' : 'roleParent')}
          </p>
          <Field label={t(lang, 'suName')} required>
            <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} className={inputClass} aria-label={t(lang, 'suName')} />
          </Field>
          {role === 'educator' && (
            <Field label={t(lang, 'suTraining')}>
              <Chips>
                {(['yes', 'no'] as const).map((v) => (
                  <Chip key={v} type="radio" name="training" checked={training === v} onChange={() => setTraining(v)}>
                    {t(lang, v === 'yes' ? 'suTrainingYes' : 'suTrainingNo')}
                  </Chip>
                ))}
              </Chips>
            </Field>
          )}
          <Check checked={mailing} onChange={setMailing}>
            {t(lang, 'suMailing')}
          </Check>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={state.kind === 'busy' || !name.trim()} className={primaryButton}>
              {t(lang, 'akSave')}
            </button>
            {state.kind === 'saved' && (
              <span role="status" className="type-label text-tosca-dark">
                {t(lang, 'akSaved')}
              </span>
            )}
          </div>
        </Card>
      </form>
      <Card>
        <button onClick={() => void signOut().then(onGone)} className={secondaryButton}>
          {t(lang, 'akSignOut')}
        </button>
      </Card>
      <Card title={t(lang, 'akDelete')}>
        <p className="type-body">{t(lang, 'akDeleteBody')}</p>
        <button onClick={remove} disabled={state.kind === 'busy'} className="pixel-btn min-h-11 rounded border-2 border-ink bg-maroon px-4 py-2 type-button text-white hover:bg-maroon-dark disabled:opacity-60">
          {t(lang, 'akDelete')}
        </button>
      </Card>
      {state.kind === 'error' && (
        <p role="alert" className="type-body text-maroon">
          {t(lang, 'acError', { msg: state.msg })}
        </p>
      )}
    </Page>
  )
}
