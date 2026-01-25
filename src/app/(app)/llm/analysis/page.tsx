import { Suspense } from 'react';

import ClientPage from '@/app/(app)/llm/analysis/ClientPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
