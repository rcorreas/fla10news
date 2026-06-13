
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

export type NewsArticle = {
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
};

const fromFirestore = (doc: any): NewsArticle => {
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
    };
};

export async function getNews(count?: number): Promise<NewsArticle[]> {
    try {
        const newsCollection = collection(db, 'news');
        const q = count 
            ? query(newsCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(newsCollection, orderBy('publishedAt', 'desc'));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
    try {
        const allNews = await getNews();
        if (!allNews.length) {
            return [];
        }
        
        const normalizeStr = (str: string) => 
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        // Filter in JS to avoid case-sensitivity and accent issues, ensuring robust matching
        const filteredNews = allNews.filter(
            (news) => normalizeStr(news.mainCategory) === normalizeStr(category)
        );
        return filteredNews;
    } catch (error) {
        console.error(`Error fetching news for category ${category}:`, error);
        return [];
    }
}


export async function getNewsById(id: string): Promise<NewsArticle | null> {
    try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

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

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    try {
        const q = query(collection(db, "news"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching news by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllNewsSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'news'));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ slug: doc.data().slug as string })).filter(item => item.slug);
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

export async function getNewsByAuthorSlug(authorSlug: string): Promise<NewsArticle[]> {
    try {
        const allNews = await getNews();
        return allNews.filter(news => news.author && generateSlug(news.author) === authorSlug);
    } catch (error) {
        console.error(`Error fetching news for author slug ${authorSlug}:`, error);
        return [];
    }
}

export async function getNewsAuthorDetailsBySlug(authorSlug: string): Promise<{ author: string } | null> {
    try {
        const allNews = await getNews();
        const authorNews = allNews.find(news => news.author && generateSlug(news.author) === authorSlug);
        if (authorNews && authorNews.author) {
            return {
                author: authorNews.author,
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching news author details for slug ${authorSlug}:`, error);
        return null;
    }
}

export async function getAllNewsAuthorSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'news'));
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
