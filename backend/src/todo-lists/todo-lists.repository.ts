import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'crypto';

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
  private readonly tableName = 'todo_lists';
  private mockStore = new Map<string, TodoListDoc[]>(); // Fallback in-memory DB for offline compilation/testing

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async create(userId: string, name: string, description: string): Promise<TodoListDoc> {
    const client = this.client;
    const listId = client ? randomUUID() : 'list-' + Date.now();
    const doc: TodoListDoc = {
      id: listId,
      userId,
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    if (!client) {
      if (!this.mockStore.has(userId)) {
        this.mockStore.set(userId, []);
      }
      this.mockStore.get(userId)!.push(doc);
      return doc;
    }

    const { error } = await client.from(this.tableName).insert(doc);
    if (error) {
      throw new Error(`Failed to create todo list: ${error.message}`);
    }
    return doc;
  }

  async findAllByUser(userId: string): Promise<TodoListDoc[]> {
    const client = this.client;
    if (!client) {
      return this.mockStore.get(userId) || [];
    }

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch todo lists: ${error.message}`);
    }
    return data || [];
  }

  async findById(listId: string): Promise<TodoListDoc | null> {
    const client = this.client;
    if (!client) {
      for (const lists of this.mockStore.values()) {
        const found = lists.find((l) => l.id === listId);
        if (found) return found;
      }
      return null;
    }

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('id', listId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find todo list: ${error.message}`);
    }
    return data;
  }

  async update(listId: string, name?: string, description?: string): Promise<TodoListDoc | null> {
    const client = this.client;
    const updates: Partial<TodoListDoc> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (!client) {
      for (const lists of this.mockStore.values()) {
        const index = lists.findIndex((l) => l.id === listId);
        if (index !== -1) {
          lists[index] = { ...lists[index], ...updates };
          return lists[index];
        }
      }
      return null;
    }

    const { data, error } = await client
      .from(this.tableName)
      .update(updates)
      .eq('id', listId)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update todo list: ${error.message}`);
    }
    return data;
  }

  async delete(listId: string): Promise<boolean> {
    const client = this.client;
    if (!client) {
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

    const existing = await this.findById(listId);
    if (!existing) return false;

    const { error } = await client
      .from(this.tableName)
      .delete()
      .eq('id', listId);

    if (error) {
      throw new Error(`Failed to delete todo list: ${error.message}`);
    }
    
    // Attempt deleting all associated todos under this list
    try {
      const { error: todosDeleteError } = await client
        .from('todos')
        .delete()
        .eq('listId', listId);
      if (todosDeleteError) {
        this.logger.warn(`Could not clean up cascading todos for list ${listId}: ${todosDeleteError.message}`);
      }
    } catch (e) {
      this.logger.warn(`Could not clean up cascading todos for list ${listId}: ${e.message}`);
    }
    
    return true;
  }
}
