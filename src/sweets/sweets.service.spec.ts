import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { SweetsService } from './sweets.service';
import { SweetsRepository } from '../repositories/sweets.repository';
import { SearchSweetsDto } from './dto/search-sweets.dto';
import { Sweet } from '../entities/sweet.entity';
import { InventoryException } from './exceptions/inventory.exception';

describe('SweetsService', () => {
  let service: SweetsService;
  let repository: jest.Mocked<SweetsRepository>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const mockSweetsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    search: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      findOne: jest.fn(),
      update: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SweetsService,
        {
          provide: SweetsRepository,
          useValue: mockSweetsRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SweetsService>(SweetsService);
    repository = module.get(SweetsRepository);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = mockQueryRunner;

    jest.clearAllMocks();
  });

  describe('purchaseSweet', () => {
    const sweetId = 'sweet-id-123';
    let mockSweet: Sweet;

    beforeEach(() => {
      mockSweet = {
        id: sweetId,
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: 50,
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Sweet;
    });

    it('should successfully reduce quantity by one', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(mockSweet);
      mockQueryRunner.manager.update.mockResolvedValue({ affected: 1 });

      const result = await service.purchaseSweet(sweetId);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Sweet, {
        where: { id: sweetId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        Sweet,
        { id: sweetId },
        { quantity: 4 },
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw InventoryException if sweet is out of stock (quantity equals zero)', async () => {
      const outOfStockSweet = { ...mockSweet, quantity: 0 };
      mockQueryRunner.manager.findOne.mockResolvedValue(outOfStockSweet);

      await expect(service.purchaseSweet(sweetId)).rejects.toThrow(InventoryException);
      await expect(service.purchaseSweet(sweetId)).rejects.toThrow('Item is out of stock');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.manager.update).not.toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should throw InventoryException if sweet does not exist', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.purchaseSweet(sweetId)).rejects.toThrow(InventoryException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle transaction rollback on error', async () => {
      mockQueryRunner.manager.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.purchaseSweet(sweetId)).rejects.toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should construct query with name filter (partial match)', async () => {
      const searchDto: SearchSweetsDto = { name: 'jamun' };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should construct query with category filter (exact match)', async () => {
      const searchDto: SearchSweetsDto = { category: 'Traditional' };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
        { id: '2', name: 'Barfi', category: 'Traditional', price: 75, quantity: 50 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });
  });
});
