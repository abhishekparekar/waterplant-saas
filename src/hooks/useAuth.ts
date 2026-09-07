import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const profile = await authService.getProfile(firebaseUser.uid);
          if (isMounted) {
            if (profile) {
              setUser(profile);
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                role: 'owner',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          if (isMounted) {
            setUser(null);
          }
        }
      } else {
        // Do not wipe out an existing persisted user session if already set in store
        if (isMounted && !useAuthStore.getState().user) {
          setUser(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    loading,
  };
};
