import { refreshKnownDomains } from '../services/known-domains'

console.log(await refreshKnownDomains({ force: true }))
process.exit(0)
