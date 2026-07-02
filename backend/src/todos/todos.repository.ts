import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface TodoDoc {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  attachmentUrl?: string;
  createdAt: string;
}

@Injectable()
export class TodosRepository {
  private readonly logger = new Logger(TodosRepository.name);
  private readonly collectionName = 'todos';
  private mockStore = new Map<string, TodoDoc[]>(); // Fallback in-memory database

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    const db = this.firebaseService.firestore;
    if (!db) return null;
    return db.collection(this.collectionName);
  }

  async create(listId: string, userId: string, data: Partial<TodoDoc>): Promise<TodoDoc> {
    const coll = this.collection;
    const todoId = coll ? coll.doc().id : 'todo-' + Date.now();
    const doc: TodoDoc = {
      id: todoId,
      listId,
      userId,
      title: data.title || '',
      description: data.description || '',
      isCompleted: false,
      dueDate: data.dueDate,
      attachmentUrl: data.attachmentUrl,
      createdAt: new Date().toISOString(),
    };

    if (!coll) {
      if (!this.mockStore.has(listId)) {
        this.mockStore.set(listId, []);
      }
      this.mockStore.get(listId)!.push(doc);
      return doc;
    }

    await coll.doc(todoId).set(doc);
    return doc;
  }

  async findAllByList(listId: string, userId: string): Promise<TodoDoc[]> {
    const coll = this.collection;
    if (!coll) {
      return this.mockStore.get(listId) || [];
    }

    const snapshot = await coll
      .where('listId', '==', listId)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map((d) => d.data() as TodoDoc);
  }

  async findById(todoId: string): Promise<TodoDoc | null> {
    const coll = this.collection;
    if (!coll) {
      for (const listTodos of this.mockStore.values()) {
        const found = listTodos.find((t) => t.id === todoId);
        if (found) return found;
      }
      return null;
    }

    const doc = await coll.doc(todoId).get();
    if (!doc.exists) return null;
    return doc.data() as TodoDoc;
  }

  async update(todoId: string, data: Partial<TodoDoc>): Promise<TodoDoc | null> {
    const coll = this.collection;
    if (!coll) {
      for (const [listId, listTodos] of this.mockStore.entries()) {
        const index = listTodos.findIndex((t) => t.id === todoId);
        if (index !== -1) {
          listTodos[index] = { ...listTodos[index], ...data };
          return listTodos[index];
        }
      }
      return null;
    }

    const docRef = coll.doc(todoId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update(data);
    const updated = await docRef.get();
    return updated.data() as TodoDoc;
  }

  async delete(todoId: string): Promise<boolean> {
    const coll = this.collection;
    if (!coll) {
      for (const [listId, listTodos] of this.mockStore.entries()) {
        const index = listTodos.findIndex((t) => t.id === todoId);
        if (index !== -1) {
          // If mock attachment exists, simulate deletion
          const attachmentUrl = listTodos[index].attachmentUrl;
          if (attachmentUrl) {
            this.logger.log(`Mock: deleted attachment ${attachmentUrl}`);
          }
          listTodos.splice(index, 1);
          this.mockStore.set(listId, listTodos);
          return true;
        }
      }
      return false;
    }

    const docRef = coll.doc(todoId);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    // Delete attachment from Google Cloud Storage if it exists
    const todoData = doc.data() as TodoDoc;
    if (todoData.attachmentUrl) {
      try {
        const bucket = this.firebaseService.storageBucket;
        if (bucket) {
          // Extract filename from URL or path
          const urlParts = todoData.attachmentUrl.split('/');
          const filename = urlParts[urlParts.length - 1].split('?')[0];
          const file = bucket.file(`attachments/${todoData.userId}/${filename}`);
          await file.delete({ ignoreNotFound: true });
          this.logger.log(`Deleted attachment from storage: attachments/${todoData.userId}/${filename}`);
        }
      } catch (e) {
        this.logger.warn(`Could not delete attachment file: ${e.message}`);
      }
    }

    await docRef.delete();
    return true;
  }

  /**
   * Upload file buffer to Google Cloud Storage bucket
   */
  async uploadAttachment(userId: string, file: Express.Multer.File): Promise<string> {
    const bucket = this.firebaseService.storageBucket;
    const filename = `${Date.now()}-${file.originalname}`;
    const destination = `attachments/${userId}/${filename}`;

    if (!bucket) {
      this.logger.warn('GCS Bucket is unconfigured. Returning mock URL.');
      return `https://storage.googleapis.com/mock-bucket/${userId}/${filename}`;
    }

    try {
      const gcsFile = bucket.file(destination);
      await gcsFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true,
      });

      // Public read URL
      return `https://storage.googleapis.com/${bucket.name}/${destination}`;
    } catch (error) {
      this.logger.error('Error uploading file to Google Cloud Storage:', error.stack);
      throw new Error('Failed to upload file to Cloud Storage: ' + error.message);
    }
  }
}
