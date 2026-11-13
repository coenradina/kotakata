// Every route the app can show, written out so the build can give each one
// its own index.html (vite.config.ts). This file must not import anything:
// vite.config.ts loads it, and the level files pull in Blockly and Phaser.
// staticRoutes.test.ts checks the lists against the real sessions and guides.

export const PLAY_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 'train', 'tree', 'hill', 'tavern']
export const GUIDE_IDS = ['s1', 's2', 's3', 's4', 's5', 's6']
export const GUIDE_ROLES = ['guru', 'ortu']

/** Paths without the base, without leading or trailing slashes. The landing page is ''. */
export const STATIC_ROUTES: string[] = [
  '',
  'main',
  'buku',
  'panduan',
  'survei',
  'privasi',
  'admin',
  'masuk',
  'guru',
  'ortu',
  'akun',
  ...PLAY_IDS.map((id) => `main/${id}`),
  ...PLAY_IDS.map((id) => `sertifikat/${id}`),
  ...GUIDE_ROLES.flatMap((role) => GUIDE_IDS.map((id) => `panduan/${role}/${id}`)),
]
