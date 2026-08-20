import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit as firebaseLimit, doc, updateDoc, increment, getDoc } from "firebase/firestore";

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  legenda?: string;
  artist?: string;
  date: string;
  views?: number;
}

export async function getGalleryItems(limitCount?: number): Promise<GalleryItem[]> {
  try {
    const q = limitCount 
      ? query(collection(db, "galeria"), orderBy("createdAt", "desc"), firebaseLimit(limitCount))
      : query(collection(db, "galeria"), orderBy("createdAt", "desc"));
      
    const querySnapshot = await getDocs(q);
    
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl || '',
        title: data.title || data.caption || '',
        legenda: data.legenda || '',
        artist: data.artist || '',
        date: data.date || new Date().toISOString().split('T')[0],
        views: data.views || 0,
      } as GalleryItem;
    });

    return items;
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    const docRef = doc(db, 'galeria', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        imageUrl: data.imageUrl || '',
        title: data.title || data.caption || '',
        legenda: data.legenda || '',
        artist: data.artist || '',
        date: data.date || new Date().toISOString().split('T')[0],
        views: data.views || 0,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching gallery item by id ${id}:`, error);
    return null;
  }
}

export async function incrementGalleryItemViews(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'galeria', id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error(`Error incrementing views for gallery item ${id}:`, error);
  }
}
