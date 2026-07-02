import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'Work Tasks', description: 'The title/name of the Todo List' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'List of tasks related to main job projects', description: 'Brief description of the list' })
  @IsString()
  description: string;
}
