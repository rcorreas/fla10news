import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

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
    };
};

export async function getVozTorcedores(count?: number): Promise<VozTorcedor[]> {
    try {
        const vozCollection = collection(db, 'voz_torcedor');
        const q = count 
            ? query(vozCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(vozCollection, orderBy('publishedAt', 'desc'));
        
        const snapshot = await getDocs(q);
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
        const docSnap = await getDoc(docRef);

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
        const q = query(collection(db, "voz_torcedor"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching Voz do Torcedor by slug ${slug}:`, error);
        return null;
    }
}
