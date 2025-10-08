import LoginForm from '@/components/auth/LoginForm';
import LoadingDots from '@/components/ui/LoadingDots';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
     <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center overflow-x-hidden">
        <LoadingDots />
      </div>
    }>
      <LoginForm />
    </Suspense>
    </div>
  );
}