import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore/lite';

export type TirinhaItem = {
    id: string; // Firestore document ID
    title: string;
    slug: string;
    imageHome: string;
    image: string;
    image2?: string;
    image3?: string;
    image4?: string;
    description?: string;
    publishedAt: Date;
    views: number;
    dataAiHint?: string;
    videoUrl?: string;
};

const fromFirestore = (doc: any): TirinhaItem => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        imageHome: data.imageHome || data.image || '',
        image: data.image || '',
        image2: data.image2 || '',
        image3: data.image3 || '',
        image4: data.image4 || '',
        description: data.description || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        views: data.views || 0,
        dataAiHint: data.dataAiHint || 'cartoon',
        videoUrl: data.videoUrl || '',
    };
};

const SHARED_TIRINHAS_LIMIT = 50;

async function getCachedTirinhas(): Promise<TirinhaItem[]> {
    return cachedQuery(
        `tirinhas:all:${SHARED_TIRINHAS_LIMIT}`,
        async () => {
            const tirinhasCollection = collection(db, 'tirinhas');
            const q = query(tirinhasCollection, orderBy('publishedAt', 'desc'), limit(SHARED_TIRINHAS_LIMIT));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(fromFirestore);
        },
        { ttlMs: 180_000 }
    );
}

export async function getTirinhas(count?: number): Promise<TirinhaItem[]> {
    try {
        if (!count || count <= SHARED_TIRINHAS_LIMIT) {
            const cached = await getCachedTirinhas();
            return count ? cached.slice(0, count) : cached;
        }
        const tirinhasCollection = collection(db, 'tirinhas');
        const q = query(tirinhasCollection, orderBy('publishedAt', 'desc'), limit(count));
        
        const snapshot = await withTimeout(getDocs(q));
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
        const docSnap = await withTimeout(getDoc(docRef));

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
        if (typeof window === 'undefined') {
            const cachedList = await getCachedTirinhas();
            const found = cachedList.find(t => t.slug === slug);
            if (found) return found;
        }
        return await cachedQuery(
            `tirinhas:slug:${slug}`,
            async () => {
                const q = query(collection(db, "tirinhas"), where("slug", "==", slug), limit(1));
                const snapshot = await withTimeout(getDocs(q));
                if (snapshot.empty) {
                    return null;
                }
                return fromFirestore(snapshot.docs[0]);
            },
            { ttlMs: 300_000, isEmpty: (val) => val === null }
        );
    } catch (error) {
        console.error(`Error fetching tirinha by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllTirinhasSlugs(): Promise<{ slug: string }[]> {
    try {
        const allTirinhas = await getCachedTirinhas();
        return allTirinhas.filter(item => item.slug).map(item => ({ slug: item.slug }));
    } catch (error) {
        console.error("Error fetching all tirinhas slugs:", error);
        return [];
    }
}
