'use client';

import React from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { QueryParamProvider } from 'use-query-params';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryParamProvider>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider>{children}</NextUIProvider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
}
