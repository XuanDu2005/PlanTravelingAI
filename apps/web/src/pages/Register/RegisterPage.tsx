import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import AuthSwitch from '@/components/ui/auth-switch';

export default function RegisterPage() {
  const { user } = useAuth();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (user) return <Navigate to={from} replace />;

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-6 flex items-center justify-center">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-indigo-600/15 blur-[120px] rounded-full" />

      {/* Fast Sliding Auth Switcher */}
      <AuthSwitch initialMode="register" />
    </div>
  );
}
