import { Module } from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { TodoListsController } from './todo-lists.controller';
import { TodoListsRepository } from './todo-lists.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListsRepository],
  exports: [TodoListsService, TodoListsRepository],
})
export class TodoListsModule {}
