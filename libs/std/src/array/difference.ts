export function difference<T>(left: T[], right: T[]) {
  return left.filter(x => !right.includes(x)).concat(right.filter(x => !left.includes(x)));
}
