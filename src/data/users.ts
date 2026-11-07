
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, query, orderBy } from 'firebase/firestore/lite';

export type UserProfile = {
  id: string; // Firestore document ID
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Date;
  firstName?: string;
  lastName?: string;
  username?: string;
  isBlocked?: boolean;
};

const fromFirestore = (doc: any): UserProfile => {
    const data = doc.data();
    return {
        id: doc.id,
        email: data.email || '',
        role: data.role || 'user',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || '',
        isBlocked: data.isBlocked || false,
    };
};

export async function getUsers(): Promise<UserProfile[]> {
    try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}


export async function getUserCount(): Promise<number> {
    try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        return snapshot.size;
    } catch (error) {
        console.error("Error fetching user count:", error);
        return 0; // Return 0 in case of an error
    }
}
