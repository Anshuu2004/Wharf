import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.data) {
          const user = data.data;
          setAuth(
            {
              id: user.userId || user.id,
              username: user.username,
              avatar: user.avatar,
              email: user.email,
              githubCreatedAt: user.githubCreatedAt,
              isAdmin: user.isAdmin,
            },
            ''
          );
          navigate('/');
        } else {
          throw new Error('No user data');
        }
      } catch (error) {
        console.error('Failed to parse auth token', error);
        navigate('/login?error=auth_failed');
      }
    };
    initAuth();
  }, [setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-wharf-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-wharf-pink border-t-transparent animate-spin" />
        <p className="font-mono font-bold animate-pulse">Authenticating with GitHub...</p>
      </div>
    </div>
  );
};
