
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, onIdTokenChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
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

  // Mantém o cookie que autoriza as server actions do painel. O Firebase
  // renova o token sozinho e o evento dispara a cada renovação.
  useEffect(() => {
    const cancelar = onIdTokenChanged(auth, async (conta) => {
      const base = `path=/; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
      if (!conta) {
        document.cookie = `rv_sessao=; max-age=0; ${base}`;
        return;
      }
      try {
        const token = await conta.getIdToken();
        document.cookie = `rv_sessao=${token}; max-age=3300; ${base}`;
      } catch (erro) {
        console.warn('Não foi possível sincronizar a sessão do painel:', erro);
      }
    });
    return () => cancelar();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    getDoc(userDocRef).then(async (docSnap) => {
      if (cancelled) return;
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

        // Superadmins definidos por e-mail recebem o papel só em memória: o
        // Firestore não aceita mais que o próprio usuário altere `role`.
        if (isSuperAdminByEmail) {
          finalProfile.role = 'superadmin';
        }

      } else if (isSuperAdminByEmail) {
        // Doc não existe, mas o e-mail é de superadmin: perfil só em memória.
        finalProfile = {
          id: user.uid,
          email: user.email,
          role: 'superadmin',
          createdAt: null,
          isBlocked: false,
          firstName: user.email.split('@')[0],
          lastName: '',
          username: user.email.split('@')[0],
          photoURL: null,
          dob: null,
        };
      }
      
      if (!cancelled) {
        setUserProfile(finalProfile);
        setLoading(false);
      }

    }).catch((error) => {
      if (cancelled) return;
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

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
