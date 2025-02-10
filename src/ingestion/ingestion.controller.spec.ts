import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            getAllIngestions: jest.fn(),
            triggerIngestion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  describe('getAllIngestions', () => {
    it('should return all ingestions successfully', async () => {
      const result = [
        { 
          id: 1, 
          source: 'source1', 
          status: 'completed',
          created_at: new Date(),
          updated_at: new Date(),
        },
        { 
          id: 2, 
          source: 'source2', 
          status: 'in-progress',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      jest.spyOn(service, 'getAllIngestions').mockResolvedValue(result);
    
      const response = await controller.getAllIngestions();
      expect(response.status).toBe('SUCCESS');
      expect(response.message).toBe('Ingestion list fetched successfully');
      expect(response.data).toEqual(result);
    });
    

    it('should throw error if failed to retrieve ingestions', async () => {
      jest.spyOn(service, 'getAllIngestions').mockRejectedValue(new Error('Internal Error'));

      try {
        await controller.getAllIngestions();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const data = { source: 'source1' };
      const ingestionResponse = {
        message: 'Ingestion triggered successfully',
        ingestionId: 1,
        status: 'completed',
      };
      jest.spyOn(service, 'triggerIngestion').mockResolvedValue(ingestionResponse);

      const response = await controller.triggerIngestion(data);
      expect(response.status).toBe('SUCCESS');
      expect(response.message).toBe('Ingestion triggered successfully');
      expect(response.data).toEqual(ingestionResponse);
    });

    it('should throw error if ingestion fails', async () => {
      const data = { source: 'source1' };
      jest.spyOn(service, 'triggerIngestion').mockRejectedValue(new HttpException('Failed to trigger ingestion', HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await controller.triggerIngestion(data);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
