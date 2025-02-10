import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionProcess } from 'src/entity/ingestion.entity';

@Injectable()
export class IngestionService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(IngestionProcess)
    private ingestionRepo: Repository<IngestionProcess>,
  ) {}

  async getAllIngestions() {
    return await this.ingestionRepo.find();
  }
  
  async triggerIngestion(source: string) {
    const ingestion = this.ingestionRepo.create({ source, status: 'in-progress' });
    const savedIngestion = await this.ingestionRepo.save(ingestion);
    console.log(process.env.pythonApiUrl);

    try {
      const pythonApiUrl = process.env.pythonApiUrl;
      const response = await this.httpService.axiosRef.post(pythonApiUrl, { source });
      
      // we need to handle some work here based on project requirment
      await this.ingestionRepo.update(savedIngestion.id, { status: 'completed' });

      return {
        message: 'Ingestion triggered successfully',
        ingestionId: savedIngestion.id,
        status: 'completed',
      };
    } catch (error) {
      await this.ingestionRepo.update(savedIngestion.id, { status: 'failed' });
      throw new HttpException(
        error.response?.data || 'Failed to trigger ingestion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
