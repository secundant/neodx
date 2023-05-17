export const truncateString = (str: string, maxLength: number, suffix = '...') =>
  str.length <= maxLength ? str : str.slice(0, maxLength - suffix.length) + suffix;

export const quickPluralize = (count: number, one: string, other: string) =>
  rules.select(count) === 'one' ? one : other;

const rules = new Intl.PluralRules('en-US');
