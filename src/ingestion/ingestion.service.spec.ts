import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestionProcess } from 'src/entity/ingestion.entity';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

const mockIngestionRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe('IngestionService', () => {
  let ingestionService: IngestionService;
  let ingestionRepo: Repository<IngestionProcess>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: getRepositoryToken(IngestionProcess), useValue: mockIngestionRepo },
      ],
    }).compile();

    ingestionService = module.get<IngestionService>(IngestionService);
    ingestionRepo = module.get<Repository<IngestionProcess>>(getRepositoryToken(IngestionProcess));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      process.env.pythonApiUrl = 'http://fake-url';
      const mockIngestion = { id: 1, source: 'test', status: 'in-progress' };

      mockIngestionRepo.create.mockReturnValue(mockIngestion);
      mockIngestionRepo.save.mockResolvedValue(mockIngestion);
      (axios.post as jest.Mock).mockResolvedValue({ data: 'success' });
      mockIngestionRepo.update.mockResolvedValue(null);

      const result = await ingestionService.triggerIngestion('test');

      expect(result).toEqual({
        message: 'Ingestion triggered successfully',
        ingestionId: 1,
        status: 'completed',
      });
      expect(mockIngestionRepo.create).toHaveBeenCalledWith({ source: 'test', status: 'in-progress' });
      expect(mockIngestionRepo.save).toHaveBeenCalledWith(mockIngestion);
      expect(axios.post).toHaveBeenCalledWith('http://fake-url', { source: 'test' });
      expect(mockIngestionRepo.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should handle ingestion failure', async () => {
      process.env.pythonApiUrl = 'http://fake-url';
      const mockIngestion = { id: 1, source: 'test', status: 'in-progress' };

      mockIngestionRepo.create.mockReturnValue(mockIngestion);
      mockIngestionRepo.save.mockResolvedValue(mockIngestion);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Failed to trigger ingestion'));
      mockIngestionRepo.update.mockResolvedValue(null);

      await expect(ingestionService.triggerIngestion('test')).rejects.toThrow(HttpException);
      expect(mockIngestionRepo.update).toHaveBeenCalledWith(1, { status: 'failed' });
    });
  });
});
