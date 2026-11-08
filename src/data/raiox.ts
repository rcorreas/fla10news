
import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore/lite';

export type RaioxArticle = {
    id: string; // Firestore document ID
    mainCategory: string;
    title: string;
    excerpt: string;
    category: string;
    image: string; // URL to the image
    imageCredit?: string;
    image2?: string;
    imageCredit2?: string;
    dataAiHint: string;
    slug: string;
    publishedAt: Date;
    content?: string;
    author?: string;
    views: number;
    fullArticleLink?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    secondaryKeywords?: string;
    youtubeUrl?: string;
};

const fromFirestore = (doc: any): RaioxArticle => {
    const data = doc.data();
    return {
        id: doc.id,
        mainCategory: data.mainCategory || 'Futebol',
        title: data.title || '',
        excerpt: data.excerpt || '',
        category: data.category || 'Geral',
        image: data.image || 'https://placehold.co/1200x600.png',
        imageCredit: data.imageCredit || '',
        image2: data.image2,
        imageCredit2: data.imageCredit2,
        dataAiHint: data.dataAiHint || 'soccer news',
        slug: data.slug || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        content: data.content || '',
        author: data.author || 'Redação NRN',
        views: data.views || 0,
        fullArticleLink: data.fullArticleLink || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
        secondaryKeywords: data.secondaryKeywords || '',
        youtubeUrl: data.youtubeUrl || '',
    };
};

const SHARED_RAIOX_LIMIT = 50;

async function getCachedRaiox(): Promise<RaioxArticle[]> {
    return cachedQuery(
        `raiox:all:${SHARED_RAIOX_LIMIT}`,
        async () => {
            const raioxCollection = collection(db, 'raiox');
            const q = query(raioxCollection, orderBy('publishedAt', 'desc'), limit(SHARED_RAIOX_LIMIT));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(fromFirestore);
        },
        { ttlMs: 180_000 }
    );
}

export async function getRaiox(count?: number): Promise<RaioxArticle[]> {
    try {
        if (!count || count <= SHARED_RAIOX_LIMIT) {
            const cached = await getCachedRaiox();
            return count ? cached.slice(0, count) : cached;
        }
        const raioxCollection = collection(db, 'raiox');
        const q = query(raioxCollection, orderBy('publishedAt', 'desc'), limit(count));
        
        const snapshot = await withTimeout(getDocs(q));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

export async function getRaioxByCategory(category: string): Promise<RaioxArticle[]> {
    try {
        const allRaiox = await getRaiox(SHARED_RAIOX_LIMIT);
        if (!allRaiox.length) {
            return [];
        }
        
        const normalizeStr = (str: string) => 
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        // Filter in JS to avoid case-sensitivity and accent issues, ensuring robust matching
        const filteredRaiox = allRaiox.filter(
            (news) => normalizeStr(news.mainCategory) === normalizeStr(category)
        );
        return filteredRaiox;
    } catch (error) {
        console.error(`Error fetching news for category ${category}:`, error);
        return [];
    }
}


export async function getRaioxById(id: string): Promise<RaioxArticle | null> {
    try {
        const docRef = doc(db, 'raiox', id);
        const docSnap = await withTimeout(getDoc(docRef));

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching news by id ${id}:`, error);
        return null;
    }
}

export async function getRaioxBySlug(slug: string): Promise<RaioxArticle | null> {
    try {
        if (typeof window === 'undefined') {
            const cachedList = await getCachedRaiox();
            const found = cachedList.find(r => r.slug === slug);
            if (found) return found;
        }
        return await cachedQuery(
            `raiox:slug:${slug}`,
            async () => {
                const q = query(collection(db, "raiox"), where("slug", "==", slug), limit(1));
                const snapshot = await withTimeout(getDocs(q));
                if (snapshot.empty) {
                    return null;
                }
                return fromFirestore(snapshot.docs[0]);
            },
            { ttlMs: 300_000, isEmpty: (val) => val === null }
        );
    } catch (error) {
        console.error(`Error fetching news by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllRaioxSlugs(): Promise<{ slug: string }[]> {
    try {
        const allRaiox = await getCachedRaiox();
        return allRaiox.filter(item => item.slug).map(item => ({ slug: item.slug }));
    } catch (error) {
        console.error("Error fetching all news slugs:", error);
        return [];
    }
}

// Helper function to generate slugs
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}

export async function getRaioxByAuthorSlug(authorSlug: string): Promise<RaioxArticle[]> {
    try {
        const allRaiox = await getRaiox();
        return allRaiox.filter(news => news.author && generateSlug(news.author) === authorSlug);
    } catch (error) {
        console.error(`Error fetching news for author slug ${authorSlug}:`, error);
        return [];
    }
}

export async function getRaioxAuthorDetailsBySlug(authorSlug: string): Promise<{ author: string } | null> {
    try {
        const allRaiox = await getRaiox();
        const authorRaiox = allRaiox.find(news => news.author && generateSlug(news.author) === authorSlug);
        if (authorRaiox && authorRaiox.author) {
            return {
                author: authorRaiox.author,
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching news author details for slug ${authorSlug}:`, error);
        return null;
    }
}

export async function getAllRaioxAuthorSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'raiox'));
        if (snapshot.empty) {
            return [];
        }
        const authors = new Set(snapshot.docs.map(doc => doc.data().author as string).filter(Boolean));
        return Array.from(authors).map(author => ({ slug: generateSlug(author) }));
    } catch (error) {
        console.error("Error fetching all news author slugs:", error);
        return [];
    }
}
