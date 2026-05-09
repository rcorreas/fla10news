
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const SUPERADMIN_EMAILS = ['canalfladez@gmail.com', 'rcorreas@gmail.com'];

interface UserProfile {
  id: string;
  email: string | null;
  role: 'user' | 'admin' | 'superadmin';
  firstName: string;
  lastName: string;
  username: string;
  photoURL: string | null;
  dob: any;
  createdAt: any;
  isBlocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
      const isSuperAdminByEmail = !!user.email && SUPERADMIN_EMAILS.includes(user.email);
      
      let finalProfile: UserProfile | null = null;

      if (docSnap.exists()) {
        const dbProfile = docSnap.data();

        // If user is blocked and NOT a superadmin, sign out.
        if (dbProfile.isBlocked && !isSuperAdminByEmail) {
          await auth.signOut();
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // Construct the profile from DB data
        finalProfile = {
          id: docSnap.id,
          email: dbProfile.email || null,
          role: dbProfile.role || 'user',
          firstName: dbProfile.firstName || '',
          lastName: dbProfile.lastName || '',
          username: dbProfile.username || '',
          photoURL: dbProfile.photoURL || null,
          dob: dbProfile.dob || null,
          createdAt: dbProfile.createdAt || null,
          isBlocked: dbProfile.isBlocked || false,
        };

        // If they are a superadmin by email, override the role and ensure DB is consistent.
        if (isSuperAdminByEmail) {
          finalProfile.role = 'superadmin';
          if (dbProfile.role !== 'superadmin') {
            try {
              await updateDoc(userDocRef, { role: 'superadmin' });
            } catch (err) {
              console.warn("Could not update superadmin role in DB:", err);
            }
          }
        }
        
      } else if (isSuperAdminByEmail) {
        // Doc doesn't exist, but user is a superadmin. Create the document.
        const newSuperAdminProfile = {
          email: user.email,
          role: 'superadmin' as const,
          createdAt: serverTimestamp(),
          isBlocked: false,
          firstName: user.email.split('@')[0], // Default name
          lastName: '',
          username: user.email.split('@')[0],
          photoURL: null,
          dob: null,
        };
        try {
          await setDoc(userDocRef, newSuperAdminProfile);
        } catch (err) {
          console.warn("Could not create superadmin profile in DB:", err);
        }
        finalProfile = { ...newSuperAdminProfile, id: user.uid, createdAt: new Date() };
      }
      
      setUserProfile(finalProfile);
      setLoading(false);

    }, (error) => {
      console.error("Error fetching user profile:", error);
      
      const isSuperAdminByEmail = !!user.email && SUPERADMIN_EMAILS.includes(user.email);
      if (isSuperAdminByEmail) {
         setUserProfile({
          id: user.uid,
          email: user.email,
          role: 'superadmin',
          firstName: user.email!.split('@')[0],
          lastName: '',
          username: user.email!.split('@')[0],
          photoURL: null,
          dob: null,
          createdAt: new Date(),
          isBlocked: false,
         });
      } else {
         setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
