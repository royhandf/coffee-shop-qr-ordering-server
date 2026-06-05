import {
  Controller,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dt';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { dot } from 'node:test/reporters';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // POST /pai/categories
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  // GET /api/categories
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.id);
  }

  // PATCH /api/categories/:id
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, dto);
  }

  // DELETE /api/categories/:id
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
