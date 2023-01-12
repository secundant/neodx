export const clsx = (...classes: Array<string | number | false>) =>
  classes.filter(Boolean).join(' ');
