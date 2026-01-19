import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  uploadCount: number;
  hasPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  incrementUploadCount: () => Promise<boolean>;
  canUpload: () => boolean;
  remainingUploads: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_UPLOAD_LIMIT = 5;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL,
          uploadCount: data.uploadCount || 0,
          hasPaid: data.hasPaid || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      } else {
        // Create new user profile
        const newProfile: Omit<UserProfile, 'uid'> = {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL,
          uploadCount: 0,
          hasPaid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userRef, newProfile);

        return {
          uid: firebaseUser.uid,
          ...newProfile,
        };
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchOrCreateProfile(user);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profileData = await fetchOrCreateProfile(firebaseUser);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const canUpload = (): boolean => {
    if (!profile) return false;
    if (profile.hasPaid) return true;
    return profile.uploadCount < FREE_UPLOAD_LIMIT;
  };

  const remainingUploads = (): number => {
    if (!profile) return 0;
    if (profile.hasPaid) return Infinity;
    return Math.max(0, FREE_UPLOAD_LIMIT - profile.uploadCount);
  };

  const incrementUploadCount = async (): Promise<boolean> => {
    if (!user || !profile) return false;
    if (!canUpload()) return false;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        uploadCount: profile.uploadCount + 1,
        updatedAt: new Date(),
      });

      // Update local profile
      setProfile({
        ...profile,
        uploadCount: profile.uploadCount + 1,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error incrementing upload count:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
        incrementUploadCount,
        canUpload,
        remainingUploads,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
