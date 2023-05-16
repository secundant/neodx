export const truncateString = (str: string, maxLength: number, suffix = '...') =>
  str.length <= maxLength ? str : str.slice(0, maxLength - suffix.length) + suffix;
