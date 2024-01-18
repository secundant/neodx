import { useState } from 'react';

export interface UseItemDescriptionParams {
  initialValue: string;
}

export function useItemDescription({ initialValue }: UseItemDescriptionParams) {
  const [value, setValue] = useState(initialValue);

  return [value, setValue];
}
