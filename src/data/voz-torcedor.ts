import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore/lite';

export type VozTorcedor = {
    id: string; // Firestore document ID
    authorName: string;
    title: string;
    summary: string;
    content: string;
    image?: string; // Optional image
    slug: string;
    publishedAt: Date;
    views: number;
    videoUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    secondaryKeywords?: string;
    status?: 'draft' | 'published';
};

// Helper function to generate slugs
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}

const fromFirestore = (doc: any): VozTorcedor => {
    const data = doc.data();

    return {
        id: doc.id,
        authorName: data.authorName || 'Anônimo',
        title: data.title || '',
        summary: data.summary || '',
        content: data.content || '',
        image: data.image || '',
        slug: data.slug || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
        secondaryKeywords: data.secondaryKeywords || '',
        status: data.status || 'published',
    };
};

const SHARED_VOZ_LIMIT = 60;

async function getCachedVozTorcedores(): Promise<VozTorcedor[]> {
    return cachedQuery(
        `voz:all:${SHARED_VOZ_LIMIT}`,
        async () => {
            const vozCollection = collection(db, 'voz_torcedor');
            const q = query(vozCollection, orderBy('publishedAt', 'desc'), limit(SHARED_VOZ_LIMIT));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(fromFirestore);
        },
        { ttlMs: 180_000 }
    );
}

export async function getVozTorcedores(count?: number): Promise<VozTorcedor[]> {
    try {
        if (!count || count <= SHARED_VOZ_LIMIT) {
            const cached = await getCachedVozTorcedores();
            return count ? cached.slice(0, count) : cached;
        }
        const vozCollection = collection(db, 'voz_torcedor');
        const q = query(vozCollection, orderBy('publishedAt', 'desc'), limit(count));
        
        const snapshot = await withTimeout(getDocs(q));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching Voz do Torcedor:", error);
        return [];
    }
}

export async function getVozTorcedorById(id: string): Promise<VozTorcedor | null> {
    try {
        const docRef = doc(db, 'voz_torcedor', id);
        const docSnap = await withTimeout(getDoc(docRef));

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such Voz do Torcedor document!");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching Voz do Torcedor by id ${id}:`, error);
        return null;
    }
}

export async function getVozTorcedorBySlug(slug: string): Promise<VozTorcedor | null> {
    try {
        if (typeof window === 'undefined') {
            const cachedList = await getCachedVozTorcedores();
            const foundInCache = cachedList.find(v => v.slug === slug);
            if (foundInCache) {
                return foundInCache;
            }
        }
        return await cachedQuery(
            `voz:slug:${slug}`,
            async () => {
                const q = query(collection(db, "voz_torcedor"), where("slug", "==", slug), limit(1));
                const snapshot = await withTimeout(getDocs(q));

                if (snapshot.empty) {
                    return null;
                }
                return fromFirestore(snapshot.docs[0]);
            },
            { ttlMs: 300_000, isEmpty: (val) => val === null }
        );
    } catch (error) {
        console.error(`Error fetching Voz do Torcedor by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllVozTorcedorSlugs(): Promise<{ slug: string }[]> {
    try {
        const allVoz = await getCachedVozTorcedores();
        return allVoz.filter(item => item.slug).map(item => ({ slug: item.slug }));
    } catch (error) {
        console.error("Error fetching all Voz do Torcedor slugs:", error);
        return [];
    }
}

export async function incrementVozTorcedorViews(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'voz_torcedor', id);
        await updateDoc(docRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error(`Error incrementing views for voz torcedor item ${id}:`, error);
    }
}
