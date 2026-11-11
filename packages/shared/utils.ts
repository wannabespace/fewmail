// oxlint-disable-next-line eslint/no-empty-function
export const noop = () => {}

export const pseudoRandom = (seed: number) =>
  Math.abs(Math.sin(seed * 127.1 + 311.7)) % 1

export const toError = (cause: unknown) =>
  cause instanceof Error ? cause : new Error(String(cause))
