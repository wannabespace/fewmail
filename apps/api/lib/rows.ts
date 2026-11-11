export const expectRow = <T>(row: T | undefined): T => {
  if (row === undefined) {
    throw new Error('Expected a row to be returned')
  }
  return row
}
