import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

export type Video = {
    id: string; // Firestore document ID
    title: string;
    duration: string;
    image: string; // URL to the image
    dataAiHint: string;
    slug: string;
    publishedAt: Date;
    category: string;
    views: number;
    videoUrl?: string;
};

const fromFirestore = (doc: any): Video => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        duration: data.duration || '00:00',
        image: data.image || 'https://placehold.co/600x400.png',
        dataAiHint: data.dataAiHint || 'video',
        slug: data.slug || '',
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        category: data.category || 'Geral',
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
    };
};

export async function getVideos(count?: number): Promise<Video[]> {
    try {
        const videosCollection = collection(db, 'videos');
        const q = count
            ? query(videosCollection, orderBy('publishedAt', 'desc'), limit(count))
            : query(videosCollection, orderBy('publishedAt', 'desc'));

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            // Return default static data if the collection is empty
            return defaultVideos.slice(0, count);
        }
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching videos:", error);
        return defaultVideos.slice(0, count);
    }
}

export async function getVideoById(id: string): Promise<Video | null> {
    try {
        const docRef = doc(db, 'videos', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such video document!");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching video by id ${id}:`, error);
        return null;
    }
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
    try {
        const q = query(collection(db, "videos"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching video by slug ${slug}:`, error);
        return null;
    }
}

export async function getAllVideoSlugs(): Promise<{ slug: string }[]> {
     try {
        const snapshot = await getDocs(collection(db, 'videos'));
        if (snapshot.empty) {
            return defaultVideos.map(video => ({ slug: video.slug }));
        }
        return snapshot.docs.map(doc => ({ slug: doc.data().slug as string })).filter(item => item.slug);
    } catch (error) {
        console.error("Error fetching all video slugs:", error);
        return defaultVideos.map(video => ({ slug: video.slug }));
    }
}


// --- Static data as fallback ---
const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Add ID to the static data for fallback compatibility
export const defaultVideos: Video[] = [
    { id: "static1", title: "Bastidores da vitória no clássico", category: "Bastidores", duration: "10:32", image: "https://placehold.co/600x400.png", dataAiHint: "locker room", slug: "bastidores-vitoria-classico", views: 152, publishedAt: daysAgo(1), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static2", title: "Entrevista exclusiva com o artilheiro", category: "Entrevistas", duration: "05:12", image: "https://placehold.co/600x400.png", dataAiHint: "player interview", slug: "entrevista-artilheiro", views: 98, publishedAt: daysAgo(2), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static3", title: "Golaços do Mengão no mês", category: "Gols", duration: "03:45", image: "https://placehold.co/600x400.png", dataAiHint: "soccer goal", slug: "golacos-mes", views: 234, publishedAt: daysAgo(4), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static4", title: "TBT: Relembre a conquista da Libertadores 2019", category: "Histórico", duration: "15:20", image: "https://placehold.co/600x400.png", dataAiHint: "trophy celebration", slug: "tbt-libertadores-2019", views: 120, publishedAt: daysAgo(7), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static5", title: "Treino aberto para a Nação no Maracanã", category: "Treinos", duration: "08:55", image: "https://placehold.co/600x400.png", dataAiHint: "soccer training", slug: "treino-aberto-nacao", views: 78, publishedAt: daysAgo(10), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static6", title: "Desafios e brincadeiras com os jogadores", category: "Bastidores", duration: "07:30", image: "https://placehold.co/600x400.png", dataAiHint: "players laughing", slug: "desafios-jogadores", views: 345, publishedAt: daysAgo(15), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "static7", title: "LUCAS PAQUETÁ JÁ TREINA COM BOLA", category: "Treinos", duration: "04:20", image: "https://placehold.co/600x400.png", dataAiHint: "Paquetá training", slug: "paqueta-treino-com-bola", views: 124, publishedAt: daysAgo(1), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];
