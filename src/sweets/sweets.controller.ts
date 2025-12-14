import { Controller, Post, Body, Get, Param, Query, Delete, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SweetsService } from './sweets.service';
import { CreateSweetDto } from '../dto/create-sweet.dto';
import { SearchSweetsDto } from './dto/search-sweets.dto';
import { RestockDto } from './dto/restock.dto';
import { Sweet } from '../entities/sweet.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sweets')
export class SweetsController {
  constructor(private readonly sweetsService: SweetsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createSweet(@Body() createSweetDto: CreateSweetDto): Promise<Sweet> {
    return await this.sweetsService.create(createSweetDto);
  }

  @Get()
  async findAll(): Promise<Sweet[]> {
    return await this.sweetsService.findAll();
  }

  @Get('search')
  async search(@Query() searchDto: SearchSweetsDto): Promise<Sweet[]> {
    return await this.sweetsService.search(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sweet> {
    const sweet = await this.sweetsService.findOne(id);
    if (!sweet) {
      throw new NotFoundException('Sweet not found');
    }
    return sweet;
  }

  @Post(':id/purchase')
  @UseGuards(AuthGuard('jwt'))
  async purchase(@Param('id') id: string): Promise<Sweet> {
    return await this.sweetsService.purchaseSweet(id);
  }

  @Post(':id/restock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async restock(@Param('id') id: string, @Body() restockDto: RestockDto): Promise<Sweet> {
    return await this.sweetsService.restock(id, restockDto.quantity);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    const sweet = await this.sweetsService.findOne(id);
    if (!sweet) {
      throw new NotFoundException('Sweet not found');
    }
    await this.sweetsService.remove(id);
  }
}

