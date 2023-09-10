'use client';

import React from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { QueryParamProvider } from 'use-query-params';

export function Providers({ children }) {
  return (
    <QueryParamProvider>
      <NextUIProvider>{children}</NextUIProvider>
    </QueryParamProvider>
  );
}
