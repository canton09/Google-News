import { NewsData } from "../types";

const DB_NAME = 'AINewsDatabase';
const STORE_NAME = 'news_history';
const DB_VERSION = 1;

// Initialize and open the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Database error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create indexes for searching/sorting
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('headline', 'headline', { unique: false });
      }
    };
  });
};

// Save a single news item
export const saveNewsItem = async (item: NewsData): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item); // put will update if id exists, add if not

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save to DB:", error);
    throw error;
  }
};

// Get all history sorted by date (newest first)
export const getAllNewsHistory = async (): Promise<NewsData[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as NewsData[];
        // Ensure timestamp is a Date object (IDB preserves it, but good to be safe)
        // and sort descending
        const sorted = results
          .map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to fetch from DB:", error);
    return [];
  }
};

// Utility: Clear old records (e.g., keep only last 50) - optional for future use
export const trimDatabase = async (keepCount: number = 50): Promise<void> => {
    const all = await getAllNewsHistory();
    if (all.length <= keepCount) return;

    const toDelete = all.slice(keepCount); // Since all is sorted Newest -> Oldest, the end of array is oldest
    const db = await initDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    toDelete.forEach(item => {
        store.delete(item.id);
    });
};