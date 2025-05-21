export const sum = ({ a, b }: { a: number | null; b: number | null }): number => {
  if (a === null || b === null) {
    throw new Error('Invalid input: null value')
  }
  return a + b
}
