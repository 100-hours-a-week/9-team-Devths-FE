import ClientPage from '@/app/(app)/llm/chat/ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
