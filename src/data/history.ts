
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

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
    };
};

export async function getHistoryArticles(count?: number): Promise<HistoryArticle[]> {
    try {
        const historyCollection = collection(db, 'history');
        const q = count
            ? query(historyCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(historyCollection, orderBy('publishedAt', 'desc'));

        const snapshot = await getDocs(q);
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
        const docSnap = await getDoc(docRef);

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
        const q = query(collection(db, "history"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Fallback to static data if not found in Firestore
            const staticArticle = defaultHistoryArticles.find(a => a.slug === slug);
            return staticArticle || null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching history article by slug ${slug}:`, error);
        const staticArticle = defaultHistoryArticles.find(a => a.slug === slug);
        return staticArticle || null;
    }
}

export async function getAllHistorySlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'history'));
        const dbSlugs = snapshot.docs.map(doc => ({ slug: doc.data().slug as string })).filter(item => item.slug);
        const staticSlugs = defaultHistoryArticles.map(a => ({ slug: a.slug }));
        
        // Combine and remove duplicates
        const allSlugs = [...dbSlugs, ...staticSlugs];
        const uniqueSlugs = Array.from(new Map(allSlugs.map(item => [item['slug'], item])).values());
        
        return uniqueSlugs;
    } catch (error) {
        console.error("Error fetching all history slugs:", error);
        return defaultHistoryArticles.map(a => ({ slug: a.slug }));
    }
}
