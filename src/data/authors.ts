import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc, Timestamp, where } from 'firebase/firestore';
import { slugify } from '@/lib/utils';

export type Author = {
    id: string; // Firestore document ID
    name: string;
    slug: string;
    link?: string;
    image?: string;
    description?: string;
    createdAt?: Date;
};

const fromFirestore = (doc: any): Author => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name || '',
        slug: data.slug || slugify(data.name || ''),
        link: data.link || '',
        image: data.image || '',
        description: data.description || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    };
};

export async function getAuthors(): Promise<Author[]> {
    try {
        const authorsCollection = collection(db, 'authors');
        // We order by name or createdAt if necessary. We'll use name for simplicity or createdAt desc.
        const q = query(authorsCollection, orderBy('name', 'asc'));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching authors:", error);
        return [];
    }
}

export async function getAuthorById(id: string): Promise<Author | null> {
    try {
        const docRef = doc(db, 'authors', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching author by id ${id}:`, error);
        return null;
    }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
        const authorsCollection = collection(db, 'authors');
        const q = query(authorsCollection, where('slug', '==', slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching author by slug ${slug}:`, error);
        return null;
    }
}
