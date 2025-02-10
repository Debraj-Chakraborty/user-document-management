import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestionProcess } from 'src/entity/ingestion.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';

const mockIngestionRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockHttpService = {
  axiosRef: {
    post: jest.fn(),
  },
};

describe('IngestionService', () => {
  let ingestionService: IngestionService;
  let ingestionRepo: Repository<IngestionProcess>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: getRepositoryToken(IngestionProcess), useValue: mockIngestionRepo },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    ingestionService = module.get<IngestionService>(IngestionService);
    ingestionRepo = module.get<Repository<IngestionProcess>>(getRepositoryToken(IngestionProcess));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllIngestions', () => {
    it('should return a list of ingestions', async () => {
      const mockData = [{ id: 1, source: 'test', status: 'completed' }];
      mockIngestionRepo.find.mockResolvedValue(mockData);

      const result = await ingestionService.getAllIngestions();
      expect(result).toEqual(mockData);
      expect(mockIngestionRepo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      process.env.pythonApiUrl = 'http://fake-url';
      const mockIngestion = { id: 1, source: 'test', status: 'in-progress' };
      const mockResponse = { data: 'success' };

      mockIngestionRepo.create.mockReturnValue(mockIngestion);
      mockIngestionRepo.save.mockResolvedValue(mockIngestion);
      mockHttpService.axiosRef.post.mockResolvedValue(of(mockResponse));
      mockIngestionRepo.update.mockResolvedValue(null);

      const result = await ingestionService.triggerIngestion('test');

      expect(result).toEqual({
        message: 'Ingestion triggered successfully',
        ingestionId: 1,
        status: 'completed',
      });
      expect(mockIngestionRepo.create).toHaveBeenCalledWith({ source: 'test', status: 'in-progress' });
      expect(mockIngestionRepo.save).toHaveBeenCalledWith(mockIngestion);
      expect(mockHttpService.axiosRef.post).toHaveBeenCalledWith('http://fake-url', { source: 'test' });
      expect(mockIngestionRepo.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should handle ingestion failure', async () => {
      process.env.pythonApiUrl = 'http://fake-url';
      const mockIngestion = { id: 1, source: 'test', status: 'in-progress' };
      const mockError = new Error('Failed to trigger ingestion');

      mockIngestionRepo.create.mockReturnValue(mockIngestion);
      mockIngestionRepo.save.mockResolvedValue(mockIngestion);
      mockHttpService.axiosRef.post.mockImplementation(() => throwError(() => mockError));
      mockIngestionRepo.update.mockResolvedValue(null);

      await expect(ingestionService.triggerIngestion('test')).rejects.toThrow(HttpException);
      await expect(ingestionService.triggerIngestion('test')).rejects.toThrow('Failed to trigger ingestion');
      expect(mockIngestionRepo.update).toHaveBeenCalledWith(1, { status: 'failed' });
    });
  });
});