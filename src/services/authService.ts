import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '@/types/user';

export const authService = {
  /**
   * Signs in user with email and password and loads their role/profile
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found in database.');
    }
    
    return userDoc.data() as UserProfile;
  },

  /**
   * Registers a new user and sets their initial role in Firestore
   */
  async signUp(
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole, 
    phoneNumber?: string,
    businessName?: string,
    address?: string
  ): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, { displayName });
    
    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      email,
      displayName,
      role,
      phoneNumber,
      businessName,
      address,
      createdAt: now,
      updatedAt: now
    };
    
    // Save profile to Firestore under user.uid
    await setDoc(doc(db, 'tenants', 'waterplant', 'users', user.uid), profile);
    
    // Also persist under user mobile node for multi-tenant structure
    if (phoneNumber) {
      const cleanMobile = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
      if (cleanMobile) {
        await setDoc(doc(db, 'tenants', 'waterplant', 'users', cleanMobile), profile, { merge: true });
      }
    }
    
    return profile;
  },

  /**
   * Registers a helper (driver) via a secondary Firebase app instance to avoid logging out the current owner
   */
  async registerHelper(
    email: string, 
    password: string, 
    displayName: string, 
    phoneNumber: string, 
    address?: string
  ): Promise<UserProfile> {
    // Lazy import setup configuration to avoid circular dependencies
    const { initializeApp } = require('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
    const { APP_CONFIG } = require('@/constants/config');

    const tempAppName = `HelperTempApp_${Date.now()}`;
    const tempApp = initializeApp(APP_CONFIG.firebase, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      const tempUser = userCredential.user;
      
      await updateProfile(tempUser, { displayName });
      
      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: tempUser.uid,
        email,
        displayName,
        role: 'helper',
        phoneNumber,
        address,
        createdAt: now,
        updatedAt: now
      };
      
      // Save profile to Firestore using the primary db reference
      await setDoc(doc(db, 'tenants', 'waterplant', 'users', tempUser.uid), profile);
      
      return profile;
    } finally {
      // Clean up temporary application context
      await tempApp.delete();
    }
  },

  /**
   * Logs out current user
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  /**
   * Get user profile from db
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  },

  /**
   * Updates user profile in Firestore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { setDoc } = require('firebase/firestore');
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', uid);
    const now = new Date().toISOString();
    const payload = {
      ...updates,
      updatedAt: now
    };
    
    // Use setDoc with merge: true so it never throws "No document to update"
    await setDoc(userDocRef, payload, { merge: true });
    
    // Also sync to mobile number reference
    if (updates.phoneNumber || updates.phone) {
      const rawPhone = (updates.phoneNumber || updates.phone || '');
      const cleanMobile = rawPhone.replace(/[^0-9]/g, '').slice(-10);
      if (cleanMobile) {
        await setDoc(doc(db, 'tenants', 'waterplant', 'users', cleanMobile), payload, { merge: true });
      }
    }

    // Also sync to plant_profile settings document
    try {
      const plantDocRef = doc(db, 'tenants', 'waterplant', 'settings', 'plant_profile');
      await setDoc(plantDocRef, {
        ...(updates.businessName ? { businessName: updates.businessName } : {}),
        ...(updates.displayName ? { ownerName: updates.displayName } : {}),
        ...(updates.phoneNumber ? { phone: updates.phoneNumber } : {}),
        ...(updates.phone ? { phone: updates.phone } : {}),
        ...(updates.address ? { address: updates.address } : {}),
        ...(updates.pricePerJar !== undefined ? { defaultPrice: updates.pricePerJar } : {}),
        ...(updates.depositPerJar !== undefined ? { defaultDeposit: updates.depositPerJar } : {}),
        ...(updates.fssaiLicense ? { fssaiLicense: updates.fssaiLicense } : {}),
        ...(updates.gstNumber ? { gstNumber: updates.gstNumber } : {}),
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Could not sync plant_profile:', e);
    }
    
    // Update display name in Firebase auth session if modified
    if (updates.displayName && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: updates.displayName });
      } catch (e) {}
    }
    
    const updated = await this.getProfile(uid);
    return updated || (payload as UserProfile);
  }
};
