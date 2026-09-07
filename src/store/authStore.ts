import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserRole } from '@/types/user';
import { authService } from '@/services/authService';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole, 
    phoneNumber?: string,
    businessName?: string,
    address?: string
  ) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const profile = await authService.signIn(email, password);
          set({ user: profile, loading: false });
          return profile;
        } catch (err: any) {
          set({ error: err.message || 'Failed to sign in', loading: false });
          throw err;
        }
      },
      
      signUp: async (email, password, displayName, role, phoneNumber, businessName, address) => {
        set({ loading: true, error: null });
        try {
          const profile = await authService.signUp(email, password, displayName, role, phoneNumber, businessName, address);
          set({ user: profile, loading: false });
          return profile;
        } catch (err: any) {
          set({ error: err.message || 'Failed to register', loading: false });
          throw err;
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const currentUser = get().user || {
          uid: 'owner_default',
          email: 'owner@nextwater.com',
          displayName: 'Abhishek',
          role: 'owner',
          businessName: 'Abhiraj Water Plant',
          phoneNumber: '8485877633',
          address: 'Industrial MIDC, Sector 4, Water Hub',
          pricePerJar: 35,
          depositPerJar: 150,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const now = new Date().toISOString();
        const mergedProfile: UserProfile = {
          ...currentUser,
          ...updates,
          updatedAt: now,
        };

        // 1. Immediately update Zustand store & AsyncStorage so UI never delays or loses edits
        set({ user: mergedProfile, loading: false, error: null });

        // 2. Persist to Firestore database
        try {
          await authService.updateUserProfile(mergedProfile.uid, updates);
        } catch (err: any) {
          console.warn('Firestore remote update warning (persisted locally):', err?.message || err);
        }

        return mergedProfile;
      },
      
      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await authService.signOut();
          set({ user: null, loading: false });
        } catch (err: any) {
          set({ user: null, loading: false });
        }
      }
    }),
    {
      name: 'nextwater-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
