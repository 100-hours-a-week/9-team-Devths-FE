import ClientPage from '@/app/(app)/llm/analysis/ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
