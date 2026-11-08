
import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore/lite';

export type HistoryArticle = {
    id: string; // Firestore document ID
    title: string;
    subtitle: string;
    author: string;
    image: string; // URL to the image
    imageCredit1?: string;
    image2?: string;
    imageCredit2?: string;
    videoUrl?: string;
    slug: string;
    publishedAt: Date;
    content: string;
    dataAiHint?: string;
    views: number;
    status?: 'draft' | 'published';
};

// Helper to create a date in the past
const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Default data to ensure the site has content on first load
export const defaultHistoryArticles: HistoryArticle[] = [
    {
        id: "static-mundial-81",
        title: "Mundial de 1981: O Dia em que o Mundo se Curvou ao Flamengo",
        subtitle: "Relembre a vitória épica por 3 a 0 sobre o Liverpool que consagrou a geração de Zico.",
        author: "Redação NRN",
        image: "https://i.postimg.cc/15V6qNdq/images-1.jpg",
        imageCredit1: "Revista Placar",
        image2: "https://i.postimg.cc/bvnmyGVr/61b65b9cf03d5.webp",
        imageCredit2: "Divulgação / Flamengo",
        dataAiHint: "historic trophy",
        slug: "mundial-de-1981-o-dia-em-que-o-mundo-se-curvou-ao-flamengo",
        publishedAt: new Date('1981-12-13T12:00:00Z'),
        content: "<p>Em 13 de dezembro de 1981, o Flamengo alcançou o topo do mundo. Com uma atuação de gala no Estádio Nacional de Tóquio, o time comandado por Zico, Júnior, Leandro e companhia não tomou conhecimento do poderoso Liverpool, campeão europeu da época.</p><h3>Domínio Absoluto</h3><p>Comandado pelo Maestro Júnior e com a genialidade de Zico, o Flamengo marcou três gols ainda no primeiro tempo. Nunes, o 'Artilheiro das Decisões', balançou as redes duas vezes, e Adílio completou o placar. O 3 a 0 foi um reflexo fiel do que foi o jogo: um monólogo rubro-negro, com toque de bola envolvente, técnica apurada e uma superioridade que encantou o mundo.</p><p>A vitória não apenas deu ao Flamengo o título de campeão mundial, mas também carimbou aquela geração como uma das maiores da história do futebol brasileiro. A conquista é, até hoje, um dos maiores orgulhos da Nação Rubro-Negra.</p>",
        videoUrl: "https://www.youtube.com/watch?v=kSe_x-Yk3sM",
        views: 1981,
        status: 'published',
    },
];

const fromFirestore = (doc: any): HistoryArticle => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        author: data.author || 'Redação NRN',
        image: data.image || 'https://placehold.co/1200x675.png',
        imageCredit1: data.imageCredit1,
        image2: data.image2,
        imageCredit2: data.imageCredit2,
        videoUrl: data.videoUrl,
        slug: data.slug || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        content: data.content || '',
        dataAiHint: data.dataAiHint || 'historic event',
        views: data.views || 0,
        status: data.status || 'published',
    };
};

const SHARED_HISTORY_LIMIT = 50;

async function getCachedHistory(): Promise<HistoryArticle[]> {
    return cachedQuery(
        `history:all:${SHARED_HISTORY_LIMIT}`,
        async () => {
            const historyCollection = collection(db, 'history');
            const q = query(historyCollection, orderBy('publishedAt', 'desc'), limit(SHARED_HISTORY_LIMIT));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(fromFirestore);
        },
        { ttlMs: 300_000 }
    );
}

export async function getHistoryArticles(count?: number): Promise<HistoryArticle[]> {
    try {
        if (!count || count <= SHARED_HISTORY_LIMIT) {
            const cached = await getCachedHistory();
            if (cached.length === 0) {
                return defaultHistoryArticles.slice(0, count);
            }
            return count ? cached.slice(0, count) : cached;
        }
        const historyCollection = collection(db, 'history');
        const q = query(historyCollection, orderBy('publishedAt', 'desc'), limit(count));

        const snapshot = await withTimeout(getDocs(q));
        if (snapshot.empty) {
            return defaultHistoryArticles.slice(0, count);
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching history articles:", error);
        return defaultHistoryArticles.slice(0, count);
    }
}

export async function getHistoryArticleById(id: string): Promise<HistoryArticle | null> {
    try {
        const docRef = doc(db, 'history', id);
        const docSnap = await withTimeout(getDoc(docRef));

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
             // Fallback to static data if not found in Firestore
            const staticArticle = defaultHistoryArticles.find(a => a.id === id);
            return staticArticle || null;
        }
    } catch (error) {
        console.error(`Error fetching history article by id ${id}:`, error);
        const staticArticle = defaultHistoryArticles.find(a => a.id === id);
        return staticArticle || null;
    }
}

export async function getHistoryArticleBySlug(slug: string): Promise<HistoryArticle | null> {
    try {
        if (typeof window === 'undefined') {
            const cachedList = await getCachedHistory();
            const foundInCache = cachedList.find(a => a.slug === slug);
            if (foundInCache) {
                return foundInCache;
            }
        }
        return await cachedQuery(
            `history:slug:${slug}`,
            async () => {
                const q = query(collection(db, "history"), where("slug", "==", slug), limit(1));
                const snapshot = await withTimeout(getDocs(q));

                if (snapshot.empty) {
                    const staticArticle = defaultHistoryArticles.find(a => a.slug === slug);
                    return staticArticle || null;
                }
                return fromFirestore(snapshot.docs[0]);
            },
            { ttlMs: 300_000, isEmpty: (val) => val === null }
        );
    } catch (error) {
        console.error(`Error fetching history article by slug ${slug}:`, error);
        const staticArticle = defaultHistoryArticles.find(a => a.slug === slug);
        return staticArticle || null;
    }
}

export async function getAllHistorySlugs(): Promise<{ slug: string }[]> {
    try {
        const allHistory = await getCachedHistory();
        return allHistory.filter(item => item.slug).map(item => ({ slug: item.slug }));
    } catch (error) {
        console.error("Error fetching all history slugs:", error);
        return [];
    }
}
