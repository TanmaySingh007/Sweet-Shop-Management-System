import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { SweetsRepository } from '../repositories/sweets.repository';
import { CreateSweetDto } from '../dto/create-sweet.dto';
import { SearchSweetsDto } from './dto/search-sweets.dto';
import { Sweet } from '../entities/sweet.entity';
import { InventoryException } from './exceptions/inventory.exception';

@Injectable()
export class SweetsService {
  constructor(
    private readonly sweetsRepository: SweetsRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(createSweetDto: CreateSweetDto): Promise<Sweet> {
    return await this.sweetsRepository.create(createSweetDto);
  }

  async findAll(): Promise<Sweet[]> {
    return await this.sweetsRepository.findAll();
  }

  async findOne(id: string): Promise<Sweet | null> {
    return await this.sweetsRepository.findById(id);
  }

  async search(searchDto: SearchSweetsDto): Promise<Sweet[]> {
    return await this.sweetsRepository.search(searchDto);
  }

  async remove(id: string): Promise<void> {
    await this.sweetsRepository.delete(id);
  }

  async purchaseSweet(id: string): Promise<Sweet> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the row for update to prevent race conditions
      const sweet = await queryRunner.manager.findOne(Sweet, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sweet) {
        throw new InventoryException('Sweet not found');
      }

      if (sweet.quantity <= 0) {
        throw new InventoryException('Item is out of stock');
      }

      // Decrement quantity
      await queryRunner.manager.update(
        Sweet,
        { id },
        { quantity: sweet.quantity - 1 },
      );

      await queryRunner.commitTransaction();

      // Return updated sweet
      const updatedSweet = await this.sweetsRepository.findById(id);
      return updatedSweet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async restock(id: string, quantity: number): Promise<Sweet> {
    const sweet = await this.sweetsRepository.findById(id);
    if (!sweet) {
      throw new NotFoundException('Sweet not found');
    }

    await this.sweetsRepository.updateQuantity(id, sweet.quantity + quantity);
    return await this.sweetsRepository.findById(id);
  }
}

