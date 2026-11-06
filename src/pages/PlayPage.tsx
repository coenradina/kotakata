import { useLayout } from '../layout/useLayout'
import { usePlaySession } from './play/usePlaySession'
import WidePlayLayout from './play/WidePlayLayout'

/** The game screen: one session's state, shown in the layout that fits the screen. */
export default function PlayPage({ sessionId }: { sessionId: string }) {
  const s = usePlaySession(sessionId)
  const layout = useLayout()
  void layout
  return <WidePlayLayout s={s} />
}
