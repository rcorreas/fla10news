import { db } from '@/lib/firebase';
import { collection, doc, setDoc, increment, getDocs, query, orderBy, limit } from 'firebase/firestore';

export type DailyViews = {
    date: string;
    views: number;
};

/**
 * Retorna a data no formato YYYY-MM-DD considerando o fuso horário GMT-3
 */
function getGMT3DateString(): string {
    const now = new Date();
    // UTC hours
    const utcHours = now.getUTCHours();
    // Adjust to GMT-3
    const gmt3Date = new Date(now.getTime());
    gmt3Date.setUTCHours(utcHours - 3);
    return gmt3Date.toISOString().split('T')[0];
}

export async function incrementDailyViews(): Promise<void> {
    try {
        const dateString = getGMT3DateString();
        const docRef = doc(db, 'dailyViews', dateString);
        
        await setDoc(docRef, {
            date: dateString,
            views: increment(1),
        }, { merge: true });
    } catch (error) {
        console.error("Error incrementing daily views:", error);
    }
}

export async function getDailyViews(days: number = 30): Promise<DailyViews[]> {
    try {
        const viewsCollection = collection(db, 'dailyViews');
        // We order by document ID (which is YYYY-MM-DD) descending
        const q = query(viewsCollection, orderBy('date', 'desc'), limit(days));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        
        const data = snapshot.docs.map(doc => ({
            date: doc.data().date as string,
            views: doc.data().views as number,
        }));

        // Return sorted by date ascending for the chart
        return data.reverse();
    } catch (error) {
        console.error("Error fetching daily views:", error);
        return [];
    }
}
