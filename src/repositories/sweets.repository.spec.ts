import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SweetsRepository } from './sweets.repository';
import { Sweet } from '../entities/sweet.entity';
import { SearchSweetsDto } from '../sweets/dto/search-sweets.dto';

describe('SweetsRepository', () => {
  let repository: SweetsRepository;
  let sweetRepository: Repository<Sweet>;

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SweetsRepository,
        {
          provide: getRepositoryToken(Sweet),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<SweetsRepository>(SweetsRepository);
    sweetRepository = module.get<Repository<Sweet>>(getRepositoryToken(Sweet));

    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should construct TypeORM query with name filter using ILIKE', async () => {
      const searchDto: SearchSweetsDto = { name: 'jamun' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.search(searchDto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('sweet');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.name ILIKE :name',
        { name: '%jamun%' },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should construct TypeORM query with category filter using exact match', async () => {
      const searchDto: SearchSweetsDto = { category: 'Traditional' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.search(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.category = :category',
        { category: 'Traditional' },
      );
    });

    it('should construct TypeORM query with minPrice filter', async () => {
      const searchDto: SearchSweetsDto = { minPrice: 50 };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.search(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.price >= :minPrice',
        { minPrice: 50 },
      );
    });

    it('should construct TypeORM query with maxPrice filter', async () => {
      const searchDto: SearchSweetsDto = { maxPrice: 100 };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.search(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.price <= :maxPrice',
        { maxPrice: 100 },
      );
    });

    it('should construct TypeORM query with multiple filters combined', async () => {
      const searchDto: SearchSweetsDto = {
        name: 'jamun',
        category: 'Traditional',
        minPrice: 40,
        maxPrice: 60,
      };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.search(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.name ILIKE :name',
        { name: '%jamun%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.category = :category',
        { category: 'Traditional' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.price >= :minPrice',
        { minPrice: 40 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sweet.price <= :maxPrice',
        { maxPrice: 60 },
      );
    });
  });
});
