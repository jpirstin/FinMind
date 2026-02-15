import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getToken, getRefreshToken, setToken, clearToken, clearRefreshToken } from '../../lib/auth';
import { type ReactNode } from 'react';
import { refresh } from '@/api/auth';

type Props = { children: ReactNode };

export function ProtectedRoute({ children }: Props) {
  const loc = useLocation();
  const [status, setStatus] = useState<'checking' | 'authed' | 'guest'>('checking');

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      const access = getToken();
      if (access) {
        if (active) setStatus('authed');
        return;
      }
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (active) setStatus('guest');
        return;
      }
      try {
        const data = await refresh(refreshToken);
        setToken(data.access_token);
        if (active) setStatus('authed');
      } catch {
        clearToken();
        clearRefreshToken();
        if (active) setStatus('guest');
      }
    };
    void checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return null;
  }
  if (status === 'guest') {
    return <Navigate to="/signin" replace state={{ from: loc }} />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
