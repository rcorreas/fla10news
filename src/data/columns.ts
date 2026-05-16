import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';

export type OpinionColumn = {
    id: string; // Firestore document ID
    columnName: string;
    title: string;
    author: string;
    authorImage: string;
    authorLink?: string; // Optional author link
    dataAiHint?: string;
    slug: string;
    excerpt: string;
    publishedAt: Date;
    category: string;
    content: string;
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

const fromFirestore = (doc: any): OpinionColumn => {
    const data = doc.data();
    return {
        id: doc.id,
        columnName: data.columnName || 'Coluna do Leitor',
        title: data.title || '',
        author: data.author || 'Anônimo',
        authorImage: data.authorImage || 'https://placehold.co/100x100.png',
        authorLink: data.authorLink,
        dataAiHint: data.dataAiHint || 'opinion piece',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        category: data.category || 'Opinião',
        content: data.content || '',
        views: data.views || 0,
    };
};

export async function getColumns(count?: number): Promise<OpinionColumn[]> {
    try {
        const columnsCollection = collection(db, 'columns');
        const q = count 
            ? query(columnsCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(columnsCollection, orderBy('publishedAt', 'desc'));
        
        const snapshot = await getDocs(q);
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
        const allColumns = await getColumns();
        const authorColumns = allColumns.filter(column => generateSlug(column.author) === authorSlug);
        return authorColumns;
    } catch (error) {
        console.error(`Error fetching columns for author slug ${authorSlug}:`, error);
        return [];
    }
}

export async function getColumnsByCadernoSlug(cadernoSlug: string): Promise<OpinionColumn[]> {
    try {
        const allColumns = await getColumns();
        const cadernoColumns = allColumns.filter(column => generateSlug(column.columnName) === cadernoSlug);
        return cadernoColumns;
    } catch (error) {
        console.error(`Error fetching columns for caderno slug ${cadernoSlug}:`, error);
        return [];
    }
}

export async function getAuthorDetailsBySlug(authorSlug: string): Promise<{ author: string; authorImage: string } | null> {
    try {
        const allColumns = await getColumns();
        const authorColumn = allColumns.find(column => generateSlug(column.author) === authorSlug);
        if (authorColumn) {
            return {
                author: authorColumn.author,
                authorImage: authorColumn.authorImage,
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
        const docSnap = await getDoc(docRef);

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
        const q = query(collection(db, "columns"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching column by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllColumnSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'columns'));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ slug: doc.data().slug as string })).filter(item => item.slug);
    } catch (error) {
        console.error("Error fetching all column slugs:", error);
        return [];
    }
}

export async function getAllAuthorSlugs(): Promise<{ slug: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'columns'));
        if (snapshot.empty) {
            return [];
        }
        const authors = new Set(snapshot.docs.map(doc => doc.data().author as string));
        return Array.from(authors).map(author => ({ slug: generateSlug(author) }));
    } catch (error) {
        console.error("Error fetching all author slugs:", error);
        return [];
    }
}
