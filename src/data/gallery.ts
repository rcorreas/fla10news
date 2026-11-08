import { db, withTimeout, cachedQuery } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit as firebaseLimit, doc, updateDoc, increment, getDoc } from "firebase/firestore/lite";

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  legenda?: string;
  texto?: string;
  artist?: string;
  date: string;
  views?: number;
}

const SHARED_GALLERY_LIMIT = 50;

async function getCachedGalleryItems(): Promise<GalleryItem[]> {
  return cachedQuery(
    `gallery:all:${SHARED_GALLERY_LIMIT}`,
    async () => {
      const q = query(collection(db, "galeria"), orderBy("createdAt", "desc"), firebaseLimit(SHARED_GALLERY_LIMIT));
      const querySnapshot = await withTimeout(getDocs(q));
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          imageUrl: data.imageUrl || '',
          title: data.title || data.caption || '',
          legenda: data.legenda || '',
          texto: data.texto || '',
          artist: data.artist || '',
          date: data.date || new Date().toISOString().split('T')[0],
          views: data.views || 0,
        } as GalleryItem;
      });
    },
    { ttlMs: 180_000 }
  );
}

export async function getGalleryItems(limitCount?: number): Promise<GalleryItem[]> {
  try {
    if (!limitCount || limitCount <= SHARED_GALLERY_LIMIT) {
      const cached = await getCachedGalleryItems();
      return limitCount ? cached.slice(0, limitCount) : cached;
    }
    const q = query(collection(db, "galeria"), orderBy("createdAt", "desc"), firebaseLimit(limitCount));
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl || '',
        title: data.title || data.caption || '',
        legenda: data.legenda || '',
        texto: data.texto || '',
        artist: data.artist || '',
        date: data.date || new Date().toISOString().split('T')[0],
        views: data.views || 0,
      } as GalleryItem;
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    if (typeof window === 'undefined') {
      const cachedList = await getCachedGalleryItems();
      const found = cachedList.find(g => g.id === id);
      if (found) return found;
    }
    const docRef = doc(db, 'galeria', id);
    const docSnap = await withTimeout(getDoc(docRef));

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        imageUrl: data.imageUrl || '',
        title: data.title || data.caption || '',
        legenda: data.legenda || '',
        texto: data.texto || '',
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
