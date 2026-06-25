/** Group date-bearing rows into [date, items[]] pairs, preserving input order. */
export function groupByDate<T extends { date: string }>(rows: T[]): [string, T[]][] {
  const map = new Map<string, T[]>()
  for (const row of rows) {
    const arr = map.get(row.date) ?? []
    arr.push(row)
    map.set(row.date, arr)
  }
  return [...map.entries()]
}
