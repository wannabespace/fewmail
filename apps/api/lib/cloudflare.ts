import { BlockList, isIP } from 'node:net'

/** https://www.cloudflare.com/ips/ — update when Cloudflare announces a change, or its edges get 403s. */
const RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
  // Not Cloudflare, and never what Railway's edge sees: local dev through portless and Railway's private network.
  '127.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '::1/128',
  'fc00::/7',
]

const allowed = new BlockList()
for (const range of RANGES) {
  const [network = '', prefix] = range.split('/')
  allowed.addSubnet(
    network,
    Number(prefix),
    isIP(network) === 6 ? 'ipv6' : 'ipv4'
  )
}

/**
 * Railway's edge puts the address that connected to it first in `x-forwarded-for` and drops one a client sent, so a
 * request that skipped Cloudflare (Railway's edge reached with `Host: api.fewmail.app`) names someone else there and
 * could forge `cf-connecting-ip`. No header at all is Railway's own healthcheck or the private network.
 */
export const isFromCloudflare = (forwardedFor: string | undefined) => {
  const peer = forwardedFor?.split(',')[0]?.trim()
  if (!peer) {
    return true
  }
  const family = isIP(peer)
  return family !== 0 && allowed.check(peer, family === 6 ? 'ipv6' : 'ipv4')
}
