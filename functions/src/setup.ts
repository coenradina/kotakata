// Options every function shares. Each module imports this first: ES module
// imports run before the importing file's own code, so setting these in
// index.ts after an `export … from` would come too late for that module.

import { setGlobalOptions } from 'firebase-functions/v2'
import { getApps, initializeApp } from 'firebase-admin/app'

setGlobalOptions({ region: 'asia-southeast2', maxInstances: 5 })
if (getApps().length === 0) initializeApp()
