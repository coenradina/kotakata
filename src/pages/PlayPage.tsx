import { useState } from 'react'
import ConsentCard from '../components/ConsentCard'
import { impact } from '../impact'
import { useLang } from '../lang'
import { useLayout } from '../layout/useLayout'
import { usePlaySession } from './play/usePlaySession'
import WidePlayLayout from './play/WidePlayLayout'
import PhonePlayLayout from './play/PhonePlayLayout'

/**
 * The game screen. Before the first session the player answers the consent
 * card, so the session's first events already know whether they may be sent.
 */
export default function PlayPage({ sessionId }: { sessionId: string }) {
  const [asked, setAsked] = useState(() => impact.consent() !== null)
  const { lang } = useLang()
  const layout = useLayout()
  if (!asked)
    return (
      <ConsentCard
        lang={lang}
        sheet={layout.startsWith('phone')}
        onAnswer={(yes) => {
          impact.setConsent(yes)
          setAsked(true)
        }}
      />
    )
  return <Game sessionId={sessionId} />
}

/** One session's state, shown in the layout that fits the screen. */
function Game({ sessionId }: { sessionId: string }) {
  const s = usePlaySession(sessionId)
  const layout = useLayout()
  if (layout === 'wide' || layout === 'tall') return <WidePlayLayout s={s} tall={layout === 'tall'} />
  // One phone component for both orientations, so turning the phone doesn't restart the stage.
  return <PhonePlayLayout s={s} landscape={layout === 'phone-landscape'} />
}
