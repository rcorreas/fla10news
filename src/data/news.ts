
import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore/lite';

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
    videoUrl?: string;
    videoUrl2?: string;
    videoUrl3?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    secondaryKeywords?: string;
    status?: 'draft' | 'published';
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
        videoUrl: data.videoUrl || '',
        videoUrl2: data.videoUrl2 || '',
        videoUrl3: data.videoUrl3 || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
        secondaryKeywords: data.secondaryKeywords || '',
        status: data.status || 'published',
    };
};

const SHARED_NEWS_LIMIT = 100;

async function getCachedPublishedNews(): Promise<NewsArticle[]> {
    return cachedQuery(
        `news:published:${SHARED_NEWS_LIMIT}`,
        async () => {
            const newsCollection = collection(db, 'news');
            const q = query(newsCollection, orderBy('publishedAt', 'desc'), limit(SHARED_NEWS_LIMIT + 15));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            const allFetched = snapshot.docs.map(fromFirestore);
            const now = new Date();
            return allFetched
                .filter(news => news.status !== 'draft' && news.publishedAt <= now)
                .slice(0, SHARED_NEWS_LIMIT);
        },
        { ttlMs: 180_000 }
    );
}

export async function getNews(count?: number, includeDrafts = false): Promise<NewsArticle[]> {
    try {
        if (!includeDrafts && (!count || count <= SHARED_NEWS_LIMIT)) {
            const cached = await getCachedPublishedNews();
            return count ? cached.slice(0, count) : cached;
        }

        const newsCollection = collection(db, 'news');
        const fetchLimit = count ? Math.min(count + 12, count * 3) : undefined;
        
        const q = fetchLimit 
            ? query(newsCollection, orderBy('publishedAt', 'desc'), limit(fetchLimit))
            : query(newsCollection, orderBy('publishedAt', 'desc'));
        
        const snapshot = await withTimeout(getDocs(q));
        if (snapshot.empty) {
            return [];
        }
        
        const allFetched = snapshot.docs.map(fromFirestore);
        const now = new Date();
        
        const filtered = includeDrafts 
            ? allFetched 
            : allFetched.filter(news => news.status !== 'draft' && news.publishedAt <= now);
            
        return count ? filtered.slice(0, count) : filtered;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

export async function getNewsByCategory(category: string, includeDrafts = false): Promise<NewsArticle[]> {
    try {
        const allNews = await getNews(includeDrafts ? undefined : SHARED_NEWS_LIMIT, includeDrafts);
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

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    try {
        if (typeof window === 'undefined') {
            const cachedList = await getCachedPublishedNews();
            const foundInCache = cachedList.find(n => n.slug === slug);
            if (foundInCache) {
                return foundInCache;
            }
        }
        return await cachedQuery(
            `news:slug:${slug}`,
            async () => {
                const q = query(collection(db, "news"), where("slug", "==", slug), limit(1));
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

export async function getAllNewsSlugs(): Promise<{ slug: string }[]> {
    try {
        const allNews = await getCachedPublishedNews();
        return allNews.filter(item => item.slug).map(item => ({ slug: item.slug }));
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

export async function getNewsByAuthorSlug(authorSlug: string, includeDrafts = false): Promise<NewsArticle[]> {
    try {
        const allNews = await getNews(includeDrafts ? undefined : SHARED_NEWS_LIMIT, includeDrafts);
        return allNews.filter(news => news.author && generateSlug(news.author) === authorSlug);
    } catch (error) {
        console.error(`Error fetching news for author slug ${authorSlug}:`, error);
        return [];
    }
}

export async function getNewsAuthorDetailsBySlug(authorSlug: string): Promise<{ author: string } | null> {
    try {
        const allNews = await getNews(SHARED_NEWS_LIMIT);
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
        const allNews = await getCachedPublishedNews();
        const authors = new Set(allNews.map(doc => doc.author as string).filter(Boolean));
        return Array.from(authors).map(author => ({ slug: generateSlug(author) }));
    } catch (error) {
        console.error("Error fetching all news author slugs:", error);
        return [];
    }
}
