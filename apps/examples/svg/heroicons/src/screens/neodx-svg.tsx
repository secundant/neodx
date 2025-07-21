import React, { memo } from 'react';
import type { IconName } from '../shared/ui/icon';
import { IconCard, IconsShowcase } from '../shared/ui/icons-showcase/icons-showcase.tsx';

export const neodxScreen = {
  label: '@neodx/svg',
  preview: memo(({ name }: { name: IconName }) => (
    <IconCard name={name} size="lg" className="text-blue-600" />
  )),
  ui: memo(IconsShowcase)
};
