/** Every item of a failed batch settles before the first failure is thrown, so nothing still runs after it. */
export const inBatches = async <T>(
  items: T[],
  size: number,
  run: (item: T) => Promise<unknown>
) => {
  for (let index = 0; index < items.length; index += size) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- batches cap concurrency
    const results = await Promise.allSettled(
      items.slice(index, index + size).map(run)
    )
    const failed = results.find((result) => result.status === 'rejected')
    if (failed) {
      throw failed.reason
    }
  }
}
