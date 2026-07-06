import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [SupabaseModule, AuthModule, TodoListsModule, TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
