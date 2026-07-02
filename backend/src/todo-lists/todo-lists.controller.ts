import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TodoListsService } from './todo-lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Todo Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todo-lists')
export class TodoListsController {
  constructor(private readonly todoListsService: TodoListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo list' })
  @ApiResponse({ status: 201, description: 'The todo list has been successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@GetUser('uid') userId: string, @Body() createListDto: CreateListDto) {
    return this.todoListsService.create(userId, createListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all todo lists of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns an array of todo lists.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@GetUser('uid') userId: string) {
    return this.todoListsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific todo list' })
  @ApiResponse({ status: 200, description: 'Returns the todo list details.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the list.' })
  @ApiResponse({ status: 404, description: 'Todo list not found.' })
  findOne(@GetUser('uid') userId: string, @Param('id') id: string) {
    return this.todoListsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific todo list' })
  @ApiResponse({ status: 200, description: 'Returns the updated todo list.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the list.' })
  @ApiResponse({ status: 404, description: 'Todo list not found.' })
  update(
    @GetUser('uid') userId: string,
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
  ) {
    return this.todoListsService.update(userId, id, updateListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo list and all its associated items' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the list.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own the list.' })
  @ApiResponse({ status: 404, description: 'Todo list not found.' })
  remove(@GetUser('uid') userId: string, @Param('id') id: string) {
    return this.todoListsService.remove(userId, id);
  }
}
