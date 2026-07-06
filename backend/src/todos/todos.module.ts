import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosRepository } from './todos.repository';
import { TodoListsModule } from '../todo-lists/todo-lists.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule, TodoListsModule],
  controllers: [TodosController],
  providers: [TodosService, TodosRepository],
  exports: [TodosService, TodosRepository],
})
export class TodosModule {}
