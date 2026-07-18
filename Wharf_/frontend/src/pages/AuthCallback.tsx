import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        // Decode JWT Payload To Get User Data
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        
        // Save To Store
        setAuth(
          {
            id: decoded.userId,
            username: decoded.username,
            avatar: decoded.avatar,
            email: decoded.email,
            githubCreatedAt: decoded.githubCreatedAt,
            isAdmin: decoded.isAdmin,
          },
          token
        );

        // Redirect To Home
        navigate('/');
      } catch (error) {
        console.error('Failed to parse auth token', error);
        navigate('/login?error=auth_failed');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-wharf-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-wharf-pink border-t-transparent animate-spin" />
        <p className="font-mono font-bold animate-pulse">Authenticating with GitHub...</p>
      </div>
    </div>
  );
};
