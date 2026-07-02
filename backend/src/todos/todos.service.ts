import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TodosRepository } from './todos.repository';
import { TodoListsRepository } from '../todo-lists/todo-lists.repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    private readonly repository: TodosRepository,
    private readonly listRepository: TodoListsRepository,
  ) {}

  /**
   * Verify list existence and user ownership
   */
  private async verifyListAccess(userId: string, listId: string) {
    const list = await this.listRepository.findById(listId);
    if (!list) {
      throw new NotFoundException(`Todo list with ID ${listId} not found`);
    }
    if (list.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this todo list');
    }
    return list;
  }

  async create(userId: string, listId: string, createTodoDto: CreateTodoDto, file?: Express.Multer.File) {
    await this.verifyListAccess(userId, listId);

    let attachmentUrl: string | undefined;
    if (file) {
      attachmentUrl = await this.repository.uploadAttachment(userId, file);
    }

    return this.repository.create(listId, userId, {
      ...createTodoDto,
      attachmentUrl,
    });
  }

  async findAll(userId: string, listId: string) {
    await this.verifyListAccess(userId, listId);
    return this.repository.findAllByList(listId, userId);
  }

  async findOne(userId: string, todoId: string) {
    const todo = await this.repository.findById(todoId);
    if (!todo) {
      throw new NotFoundException(`Todo item with ID ${todoId} not found`);
    }
    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this todo item');
    }
    return todo;
  }

  async update(userId: string, todoId: string, updateTodoDto: UpdateTodoDto, file?: Express.Multer.File) {
    const todo = await this.findOne(userId, todoId); // Verifies ownership

    const updates: any = { ...updateTodoDto };
    if (file) {
      updates.attachmentUrl = await this.repository.uploadAttachment(userId, file);
    }

    return this.repository.update(todoId, updates);
  }

  async remove(userId: string, todoId: string) {
    await this.findOne(userId, todoId); // Verifies ownership
    return this.repository.delete(todoId);
  }
}
