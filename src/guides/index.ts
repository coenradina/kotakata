import { GUIDE_S1 } from './s1'
import { GUIDE_S3 } from './s3'
import { GUIDE_S5 } from './s5'
import type { SessionGuide } from './types'

/** Guides for the sessions in the first release, in session order. */
export const GUIDES: SessionGuide[] = [GUIDE_S1, GUIDE_S3, GUIDE_S5]

export const guideFor = (session: string) => GUIDES.find((g) => g.session === session) ?? null

export type { Role, SessionGuide } from './types'
export { ROLES } from './types'
