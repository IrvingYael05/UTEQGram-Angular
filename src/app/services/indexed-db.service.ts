import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Post, SyncPost } from '../models/post.model';

interface UteqGramDB extends DBSchema {
  post: {
    key: string;
    value: Post;
  };
  'sync-post': {
    key: string;
    value: SyncPost;
  };
}

type StoreName = 'post' | 'sync-post';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase<UteqGramDB>>;

  constructor() {
    this.dbPromise = openDB<UteqGramDB>('uteqgram-angular-store', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('post')) {
          db.createObjectStore('post', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync-post')) {
          db.createObjectStore('sync-post', { keyPath: 'id' });
        }
      },
    });
  }

  async writeData<T extends StoreName>(store: T, data: UteqGramDB[T]['value']): Promise<void> {
    const db = await this.dbPromise;
    await db.put(store, data);
  }

  async readAllData<T extends StoreName>(store: T): Promise<UteqGramDB[T]['value'][]> {
    const db = await this.dbPromise;
    return db.getAll(store);
  }

  async clearAllData(store: StoreName): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(store);
  }

  async deleteItem(store: StoreName, id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(store, id);
  }
}
