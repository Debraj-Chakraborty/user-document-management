import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { internalServerError } from 'src/Helper/global-utils/internal-server-error';
import { ApiBody } from '@nestjs/swagger';

@Controller('ingestion')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) { }

    @Get()
    async getAllIngestions() {
        try {
            const data = await this.ingestionService.getAllIngestions();
            return {
                status: 'SUCCESS',
                time_stamp: new Date(),
                message: 'Ingestion list fetched successfully',
                data: data
            }
        } catch (error) {
            throw new HttpException(
                internalServerError(error.message || `Failed to retrieve documents`),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Post('trigger')
    @ApiBody({
        description: 'Trigger Ingestion',
        schema: {
            type: 'object',
            properties: {
                source: { type: 'string' },
            },
        },
    })
    async triggerIngestion(@Body() data: { source: string }) {
        try {
            const response = await this.ingestionService.triggerIngestion(data.source);
            return {
                status: 'SUCCESS',
                message: 'Ingestion triggered successfully',
                data: response,
            };
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Failed to trigger ingestion',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}