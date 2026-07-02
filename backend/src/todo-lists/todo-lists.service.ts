import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TodoListsRepository } from './todo-lists.repository';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class TodoListsService {
  constructor(private readonly repository: TodoListsRepository) {}

  async create(userId: string, createListDto: CreateListDto) {
    const { name, description } = createListDto;
    return this.repository.create(userId, name, description);
  }

  async findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  async findOne(userId: string, listId: string) {
    const list = await this.repository.findById(listId);
    if (!list) {
      throw new NotFoundException(`Todo list with ID ${listId} not found`);
    }
    if (list.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this todo list');
    }
    return list;
  }

  async update(userId: string, listId: string, updateListDto: UpdateListDto) {
    const list = await this.findOne(userId, listId); // Verifies existence and ownership
    return this.repository.update(list.id, updateListDto.name, updateListDto.description);
  }

  async remove(userId: string, listId: string) {
    await this.findOne(userId, listId); // Verifies existence and ownership
    return this.repository.delete(listId);
  }
}
