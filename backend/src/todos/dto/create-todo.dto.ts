import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Buy groceries', description: 'The title of the Todo item' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Milk, bread, cheese, and vegetables', description: 'Detailed description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-07-05T12:00:00.000Z', description: 'ISO date string indicating when the task is due' })
  @IsString()
  @IsOptional()
  dueDate?: string;
}
