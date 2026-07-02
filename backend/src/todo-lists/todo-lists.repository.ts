import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface TodoListDoc {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
}

@Injectable()
export class TodoListsRepository {
  private readonly logger = new Logger(TodoListsRepository.name);
  private readonly collectionName = 'todo_lists';
  private mockStore = new Map<string, TodoListDoc[]>(); // Fallback in-memory DB for offline compilation/testing

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    const db = this.firebaseService.firestore;
    if (!db) return null;
    return db.collection(this.collectionName);
  }

  async create(userId: string, name: string, description: string): Promise<TodoListDoc> {
    const coll = this.collection;
    const listId = coll ? coll.doc().id : 'list-' + Date.now();
    const doc: TodoListDoc = {
      id: listId,
      userId,
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    if (!coll) {
      if (!this.mockStore.has(userId)) {
        this.mockStore.set(userId, []);
      }
      this.mockStore.get(userId)!.push(doc);
      return doc;
    }

    await coll.doc(listId).set(doc);
    return doc;
  }

  async findAllByUser(userId: string): Promise<TodoListDoc[]> {
    const coll = this.collection;
    if (!coll) {
      return this.mockStore.get(userId) || [];
    }

    const snapshot = await coll.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((d) => d.data() as TodoListDoc);
  }

  async findById(listId: string): Promise<TodoListDoc | null> {
    const coll = this.collection;
    if (!coll) {
      for (const lists of this.mockStore.values()) {
        const found = lists.find((l) => l.id === listId);
        if (found) return found;
      }
      return null;
    }

    const doc = await coll.doc(listId).get();
    if (!doc.exists) return null;
    return doc.data() as TodoListDoc;
  }

  async update(listId: string, name?: string, description?: string): Promise<TodoListDoc | null> {
    const coll = this.collection;
    const updates: Partial<TodoListDoc> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (!coll) {
      for (const lists of this.mockStore.values()) {
        const index = lists.findIndex((l) => l.id === listId);
        if (index !== -1) {
          lists[index] = { ...lists[index], ...updates };
          return lists[index];
        }
      }
      return null;
    }

    const docRef = coll.doc(listId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as TodoListDoc;
  }

  async delete(listId: string): Promise<boolean> {
    const coll = this.collection;
    if (!coll) {
      for (const [userId, lists] of this.mockStore.entries()) {
        const index = lists.findIndex((l) => l.id === listId);
        if (index !== -1) {
          lists.splice(index, 1);
          this.mockStore.set(userId, lists);
          return true;
        }
      }
      return false;
    }

    const docRef = coll.doc(listId);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    // First delete the lists entry itself
    await docRef.delete();
    
    // Attempt deleting all associated todos under this list
    try {
      const todosColl = this.firebaseService.firestore.collection('todos');
      const todosSnapshot = await todosColl.where('listId', '==', listId).get();
      const batch = this.firebaseService.firestore.batch();
      todosSnapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      this.logger.warn(`Could not clean up cascading todos for list ${listId}: ${e.message}`);
    }
    
    return true;
  }
}
