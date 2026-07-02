import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post('list/:listId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new todo item inside a specific list' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the list.' })
  create(
    @GetUser('uid') userId: string,
    @Param('listId') listId: string,
    @Body() createTodoDto: CreateTodoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.todosService.create(userId, listId, createTodoDto, file);
  }

  @Get('list/:listId')
  @ApiOperation({ summary: 'Retrieve all todo items under a specific list' })
  @ApiResponse({ status: 200, description: 'Returns an array of todo items.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the list.' })
  findAll(@GetUser('uid') userId: string, @Param('listId') listId: string) {
    return this.todosService.findAll(userId, listId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific todo item' })
  @ApiResponse({ status: 200, description: 'Returns the todo item.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the task.' })
  @ApiResponse({ status: 404, description: 'Todo item not found.' })
  findOne(@GetUser('uid') userId: string, @Param('id') id: string) {
    return this.todosService.findOne(userId, id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a specific todo item (properties and/or upload/replace attachment)' })
  @ApiResponse({ status: 200, description: 'Returns the updated todo item.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the task.' })
  @ApiResponse({ status: 404, description: 'Todo item not found.' })
  update(
    @GetUser('uid') userId: string,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.todosService.update(userId, id, updateTodoDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo item and its stored attachment' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the item.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the task.' })
  @ApiResponse({ status: 404, description: 'Todo item not found.' })
  remove(@GetUser('uid') userId: string, @Param('id') id: string) {
    return this.todosService.remove(userId, id);
  }
}
