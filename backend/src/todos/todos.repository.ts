import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'crypto';

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
  private readonly tableName = 'todos';
  private mockStore = new Map<string, TodoDoc[]>(); // Fallback in-memory database

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async create(listId: string, userId: string, data: Partial<TodoDoc>): Promise<TodoDoc> {
    const client = this.client;
    const todoId = client ? randomUUID() : 'todo-' + Date.now();
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

    if (!client) {
      if (!this.mockStore.has(listId)) {
        this.mockStore.set(listId, []);
      }
      this.mockStore.get(listId)!.push(doc);
      return doc;
    }

    const { error } = await client.from(this.tableName).insert(doc);
    if (error) {
      throw new Error(`Failed to create todo task: ${error.message}`);
    }
    return doc;
  }

  async findAllByList(listId: string, userId: string): Promise<TodoDoc[]> {
    const client = this.client;
    if (!client) {
      return this.mockStore.get(listId) || [];
    }

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('listId', listId)
      .eq('userId', userId)
      .order('createdAt', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch todos: ${error.message}`);
    }
    return data || [];
  }

  async findById(todoId: string): Promise<TodoDoc | null> {
    const client = this.client;
    if (!client) {
      for (const listTodos of this.mockStore.values()) {
        const found = listTodos.find((t) => t.id === todoId);
        if (found) return found;
      }
      return null;
    }

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('id', todoId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find todo task: ${error.message}`);
    }
    return data;
  }

  async update(todoId: string, data: Partial<TodoDoc>): Promise<TodoDoc | null> {
    const client = this.client;
    if (!client) {
      for (const [listId, listTodos] of this.mockStore.entries()) {
        const index = listTodos.findIndex((t) => t.id === todoId);
        if (index !== -1) {
          listTodos[index] = { ...listTodos[index], ...data };
          return listTodos[index];
        }
      }
      return null;
    }

    const { data: updated, error } = await client
      .from(this.tableName)
      .update(data)
      .eq('id', todoId)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update todo task: ${error.message}`);
    }
    return updated;
  }

  async delete(todoId: string): Promise<boolean> {
    const client = this.client;
    if (!client) {
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

    const existing = await this.findById(todoId);
    if (!existing) return false;

    // Delete attachment from Supabase Storage if it exists
    if (existing.attachmentUrl) {
      try {
        const marker = '/attachments/';
        const markerIndex = existing.attachmentUrl.indexOf(marker);
        let filePath = '';
        if (markerIndex !== -1) {
          filePath = existing.attachmentUrl.substring(markerIndex + marker.length);
        } else {
          const urlParts = existing.attachmentUrl.split('/');
          const filename = urlParts[urlParts.length - 1].split('?')[0];
          filePath = `${existing.userId}/${filename}`;
        }

        const { error: storageError } = await client.storage
          .from('attachments')
          .remove([filePath]);

        if (storageError) {
          this.logger.warn(`Could not delete attachment file: ${storageError.message}`);
        } else {
          this.logger.log(`Deleted attachment from storage: ${filePath}`);
        }
      } catch (e) {
        this.logger.warn(`Could not delete attachment file: ${e.message}`);
      }
    }

    const { error: deleteError } = await client
      .from(this.tableName)
      .delete()
      .eq('id', todoId);

    if (deleteError) {
      throw new Error(`Failed to delete todo task: ${deleteError.message}`);
    }
    return true;
  }

  /**
   * Upload file buffer to Supabase Storage bucket
   */
  async uploadAttachment(userId: string, file: Express.Multer.File): Promise<string> {
    const client = this.client;
    const filename = `${Date.now()}-${file.originalname}`;
    const destination = `${userId}/${filename}`;

    if (!client) {
      this.logger.warn('Supabase client is unconfigured. Returning mock URL.');
      return `https://supabase.co/storage/v1/object/public/attachments/${userId}/${filename}`;
    }

    try {
      const { data, error } = await client.storage
        .from('attachments')
        .upload(destination, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      // Retrieve public URL
      const { data: publicUrlData } = client.storage
        .from('attachments')
        .getPublicUrl(destination);

      return publicUrlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file to Supabase Storage:', error.stack);
      throw new Error('Failed to upload file to Cloud Storage: ' + error.message);
    }
  }
}
