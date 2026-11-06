import { useLayout } from '../layout/useLayout'
import { usePlaySession } from './play/usePlaySession'
import WidePlayLayout from './play/WidePlayLayout'
import PhonePlayLayout from './play/PhonePlayLayout'

/** The game screen: one session's state, shown in the layout that fits the screen. */
export default function PlayPage({ sessionId }: { sessionId: string }) {
  const s = usePlaySession(sessionId)
  const layout = useLayout()
  if (layout === 'wide') return <WidePlayLayout s={s} />
  // One phone component for both orientations, so turning the phone doesn't restart the stage.
  return <PhonePlayLayout s={s} landscape={layout === 'phone-landscape'} />
}
