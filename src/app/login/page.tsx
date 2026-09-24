import { Suspense } from 'react';
import { LoginContent } from '@/components/modules/LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060911]" />}>
      <LoginContent />
    </Suspense>
  );
}
