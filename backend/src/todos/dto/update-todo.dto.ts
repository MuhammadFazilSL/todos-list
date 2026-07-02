import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({ example: true, description: 'Mark the task complete or incomplete' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
