import { Test, TestingModule } from '@nestjs/testing';
import { SweetsService } from './sweets.service';
import { SweetsRepository } from '../repositories/sweets.repository';
import { SearchSweetsDto } from './dto/search-sweets.dto';
import { Sweet } from '../entities/sweet.entity';

describe('SweetsService', () => {
  let service: SweetsService;
  let repository: jest.Mocked<SweetsRepository>;

  const mockSweetsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SweetsService,
        {
          provide: SweetsRepository,
          useValue: mockSweetsRepository,
        },
      ],
    }).compile();

    service = module.get<SweetsService>(SweetsService);
    repository = module.get(SweetsRepository);

    jest.clearAllMocks();
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

    it('should construct query with price range filter', async () => {
      const searchDto: SearchSweetsDto = { minPrice: 50, maxPrice: 100 };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
        { id: '2', name: 'Barfi', category: 'Traditional', price: 75, quantity: 50 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should construct query with name and category filters simultaneously', async () => {
      const searchDto: SearchSweetsDto = { name: 'jamun', category: 'Traditional' };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should construct query with name, category, and price range filters', async () => {
      const searchDto: SearchSweetsDto = {
        name: 'jamun',
        category: 'Traditional',
        minPrice: 40,
        maxPrice: 60,
      };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should handle search with only minPrice filter', async () => {
      const searchDto: SearchSweetsDto = { minPrice: 70 };
      const expectedSweets: Sweet[] = [
        { id: '2', name: 'Barfi', category: 'Traditional', price: 75, quantity: 50 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should handle search with only maxPrice filter', async () => {
      const searchDto: SearchSweetsDto = { maxPrice: 60 };
      const expectedSweets: Sweet[] = [
        { id: '1', name: 'Gulab Jamun', category: 'Traditional', price: 50, quantity: 100 } as Sweet,
      ];

      mockSweetsRepository.search.mockResolvedValue(expectedSweets);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedSweets);
    });

    it('should return empty array when no results match', async () => {
      const searchDto: SearchSweetsDto = { name: 'nonexistent' };
      mockSweetsRepository.search.mockResolvedValue([]);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual([]);
    });
  });
});

