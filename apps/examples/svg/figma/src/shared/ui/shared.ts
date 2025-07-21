import clsx from 'clsx';

export const styles = {
  control: clsx(
    'border border-neutral-400 outline-2 outline-offset-1 outline-transparent bg-white px-4 rounded-lg placeholder:text-neutral-400',
    'text-base text-violet-800 transition-colors duration-75 h-10',
    'hover:bg-neutral-50 hover:border-neutral-500',
    'focus:bg-white focus:outline-violet-800'
  )
};
