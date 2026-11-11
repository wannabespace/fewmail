export const inBatches = async <T>(
  items: T[],
  size: number,
  run: (item: T) => Promise<unknown>
) => {
  for (let index = 0; index < items.length; index += size) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- batches cap concurrency
    await Promise.allSettled(items.slice(index, index + size).map(run))
  }
}
