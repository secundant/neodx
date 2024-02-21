import { useState } from 'react';

export interface UseItemIdParams {
  initialValue: string;
}

export function useItemId({ initialValue }: UseItemIdParams) {
  const [value, setValue] = useState(initialValue);

  return [value, setValue];
}
