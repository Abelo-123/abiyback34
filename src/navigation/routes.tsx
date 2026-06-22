import type { ComponentType, JSX } from 'react';

import { TodoPage } from '@/pages/TodoPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: TodoPage, title: 'Todo' },
];

