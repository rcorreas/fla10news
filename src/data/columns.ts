import { db, withTimeout, cachedQuery } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore/lite';

export type OpinionColumn = {
    id: string; // Firestore document ID
    columnName: string;
    title: string;
    author: string;
    authorImage: string;
    authorLink?: string; // Optional author link
    authorDescription?: string; // Optional author description
    columnImage?: string; // Optional column title image
    dataAiHint?: string;
    slug: string;
    excerpt: string;
    publishedAt: Date;
    category: string;
    content: string;
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

const fromFirestore = (doc: any): OpinionColumn => {
    const data = doc.data();
    let authorImage = data.authorImage || 'https://placehold.co/100x100.png';
    const columnName = data.columnName || 'Coluna do Leitor';

    if (columnName.trim() === 'Na Pena do Urubu') {
        authorImage = 'https://i.imgur.com/5rNdCgG.png';
    }

    return {
        id: doc.id,
        columnName: columnName,
        title: data.title || '',
        author: data.author || 'Anônimo',
        authorImage: authorImage,
        authorLink: data.authorLink,
        authorDescription: data.authorDescription,
        columnImage: data.columnImage,
        dataAiHint: data.dataAiHint || 'opinion piece',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        category: data.category || 'Opinião',
        content: data.content || '',
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
        secondaryKeywords: data.secondaryKeywords || '',
        status: data.status || 'published',
    };
};

const SHARED_COLUMNS_LIMIT = 80;

async function getCachedColumns(): Promise<OpinionColumn[]> {
    return cachedQuery(
        `columns:all:${SHARED_COLUMNS_LIMIT}`,
        async () => {
            const columnsCollection = collection(db, 'columns');
            const q = query(columnsCollection, orderBy('publishedAt', 'desc'), limit(SHARED_COLUMNS_LIMIT));
            const snapshot = await withTimeout(getDocs(q));
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(fromFirestore);
        },
        { ttlMs: 180_000 }
    );
}

export async function getColumns(count?: number): Promise<OpinionColumn[]> {
    try {
        if (!count || count <= SHARED_COLUMNS_LIMIT) {
            const cached = await getCachedColumns();
            return count ? cached.slice(0, count) : cached;
        }
        const columnsCollection = collection(db, 'columns');
        const q = query(columnsCollection, orderBy('publishedAt', 'desc'), limit(count));
        const snapshot = await withTimeout(getDocs(q));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching columns:", error);
        return [];
    }
}

export async function getColumnsByAuthorSlug(authorSlug: string): Promise<OpinionColumn[]> {
    try {
        const allColumns = await getColumns(SHARED_COLUMNS_LIMIT);
        const authorColumns = allColumns.filter(column => generateSlug(column.author) === authorSlug);
        return authorColumns;
    } catch (error) {
        console.error(`Error fetching columns for author slug ${authorSlug}:`, error);
        return [];
    }
}

export async function getColumnsByCadernoSlug(cadernoSlug: string): Promise<OpinionColumn[]> {
    try {
        const allColumns = await getColumns(SHARED_COLUMNS_LIMIT);
        const cadernoColumns = allColumns.filter(column => generateSlug(column.columnName) === cadernoSlug);
        return cadernoColumns;
    } catch (error) {
        console.error(`Error fetching columns for caderno slug ${cadernoSlug}:`, error);
        return [];
    }
}

export async function getAuthorDetailsBySlug(authorSlug: string): Promise<{ author: string; authorImage: string; authorDescription?: string } | null> {
    try {
        const allColumns = await getColumns(SHARED_COLUMNS_LIMIT);
        const authorColumn = allColumns.find(column => generateSlug(column.author) === authorSlug);
        if (authorColumn) {
            return {
                author: authorColumn.author,
                authorImage: authorColumn.authorImage,
                authorDescription: authorColumn.authorDescription,
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching author details for slug ${authorSlug}:`, error);
        return null;
    }
}


export async function getColumnById(id: string): Promise<OpinionColumn | null> {
    try {
        const docRef = doc(db, 'columns', id);
        const docSnap = await withTimeout(getDoc(docRef));

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such column document!");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching column by id ${id}:`, error);
        return null;
    }
}

export async function getColumnBySlug(slug: string): Promise<OpinionColumn | null> {
    try {
        if (typeof window === 'undefined') {
            const cachedList = await getCachedColumns();
            const foundInCache = cachedList.find(c => c.slug === slug);
            if (foundInCache) {
                return foundInCache;
            }
        }
        return await cachedQuery(
            `columns:slug:${slug}`,
            async () => {
                const q = query(collection(db, "columns"), where("slug", "==", slug), limit(1));
                const snapshot = await withTimeout(getDocs(q));
                if (snapshot.empty) {
                    return null;
                }
                return fromFirestore(snapshot.docs[0]);
            },
            { ttlMs: 300_000, isEmpty: (val) => val === null }
        );
    } catch (error) {
        console.error(`Error fetching column by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllColumnSlugs(): Promise<{ slug: string }[]> {
    try {
        const allColumns = await getCachedColumns();
        return allColumns
            .filter(item => item.slug && item.slug.length < 200)
            .map(item => ({ slug: item.slug }));
    } catch (error) {
        console.error("Error fetching all column slugs:", error);
        return [];
    }
}

export async function getAllAuthorSlugs(): Promise<{ slug: string }[]> {
    try {
        return await cachedQuery(
            'authors:allSlugs',
            async () => {
                const allColumns = await getCachedColumns();
                const authorsSnapshot = await withTimeout(getDocs(collection(db, 'authors')));
                
                const slugs = new Set<string>();
                allColumns.forEach(col => {
                    if (col.author) slugs.add(generateSlug(col.author));
                });

                if (!authorsSnapshot.empty) {
                    authorsSnapshot.docs.forEach(doc => {
                        const slug = doc.data().slug as string;
                        if (slug) slugs.add(slug);
                    });
                }

                return Array.from(slugs).map(slug => ({ slug }));
            },
            { ttlMs: 300_000 }
        );
    } catch (error) {
        console.error("Error fetching all author slugs:", error);
        return [];
    }
}

export async function getColunistasSlugs(): Promise<{ slug: string }[]> {
    try {
        const allColumns = await getCachedColumns();
        const authors = new Set(allColumns.map(col => col.author).filter(Boolean));
        return Array.from(authors).map(author => ({ slug: generateSlug(author) }));
    } catch (error) {
        console.error("Error fetching colunistas slugs:", error);
        return [];
    }
}
