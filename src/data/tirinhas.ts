import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

export type TirinhaItem = {
    id: string; // Firestore document ID
    title: string;
    slug: string;
    imageHome: string;
    image: string;
    description?: string;
    publishedAt: Date;
    views: number;
    dataAiHint?: string;
};

const fromFirestore = (doc: any): TirinhaItem => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        imageHome: data.imageHome || data.image || '',
        image: data.image || '',
        description: data.description || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        views: data.views || 0,
        dataAiHint: data.dataAiHint || 'cartoon',
    };
};

export async function getTirinhas(count?: number): Promise<TirinhaItem[]> {
    try {
        const tirinhasCollection = collection(db, 'tirinhas');
        const q = count 
            ? query(tirinhasCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(tirinhasCollection, orderBy('publishedAt', 'desc'));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching tirinhas:", error);
        return [];
    }
}

export async function getTirinhaById(id: string): Promise<TirinhaItem | null> {
    try {
        const docRef = doc(db, 'tirinhas', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching tirinha by id ${id}:`, error);
        return null;
    }
}

export async function getTirinhaBySlug(slug: string): Promise<TirinhaItem | null> {
    try {
        const q = query(collection(db, "tirinhas"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching tirinha by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllTirinhasSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'tirinhas'));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ slug: doc.data().slug as string })).filter(item => item.slug);
    } catch (error) {
        console.error("Error fetching all tirinhas slugs:", error);
        return [];
    }
}
