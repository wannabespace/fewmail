import { getOS } from '@fewmail/shared/os'

const os = getOS(navigator.userAgent).type

export const isMac = os === 'macos'
export const isLinux = os === 'linux'
