import { Module } from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { TodoListsController } from './todo-lists.controller';
import { TodoListsRepository } from './todo-lists.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListsRepository],
  exports: [TodoListsService, TodoListsRepository],
})
export class TodoListsModule {}
