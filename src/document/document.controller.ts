import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException, HttpException, HttpStatus, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { internalServerError } from 'src/Helper/global-utils/internal-server-error';
import { Document } from 'src/entity/document.entity';

@Controller('documents')
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private jwtService: JwtService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: Object })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf|jpeg|png)$/)) {
          return callback(new Error('Only PDF and image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() body: { title: string },
    @UploadedFile() file: any,
    @Req() request: Request
  ) {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new Error(`Authorization header is missing`)
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error(`Token is missing in Authorization header`)
      }

      if (!body.title) {
        throw new Error('Title is required')
      }
      const payload = this.jwtService.verify(token);

      const userId = payload.sub;

      await this.documentService.create({
        title: body.title,
        uploadedBy: userId,
        filePath: file.path.replace(/\\/g, '/'),
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      return {
        status: 'SUCCESS',
        time_stamp: new Date(),
        message: 'Document uploaded successfully'
      }
    } catch (error) {
      throw new HttpException(
        internalServerError(error.message || `Internal Server Error`),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all documents' })
  @ApiResponse({
    status: 200,
    description: 'List of documents retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll() {
    try {
      const data = await this.documentService.findAll();
      return {
        status: 'SUCCESS',
        time_stamp: new Date(),
        message: 'Document list fetched successfully',
        data: data
      }
    } catch (error) {
      throw new HttpException(
        internalServerError(error.message || `Failed to retrieve documents`),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document update data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf|jpeg|png)$/)) {
          return callback(new Error('Only PDF and image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id') id: number,
    @Req() request: Request,
    @Body() body: { title?: string },
    @UploadedFile() file?: any,
  ) {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new Error(`Authorization header is missing`);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error(`Token is missing in Authorization header`);
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const updatedData: Partial<Document> = {
        title: body.title,
        updated_by: userId,
        updated_on: new Date(),
      };

      if (file) {
        updatedData.filePath = file.path.replace(/\\/g, '/');
        updatedData.fileName = file.originalname;
        updatedData.mimeType = file.mimetype;
        updatedData.fileSize = file.size;
      }

      await this.documentService.update(id, updatedData);

      return {
        status: 'SUCCESS',
        time_stamp: new Date(),
        message: 'Document updated successfully',
      };
    } catch (error) {
      throw new HttpException(internalServerError(error.message || 'Internal Server Error'), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document (soft delete)' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: number, @Req() request: Request) {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new Error(`Authorization header is missing`);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error(`Token is missing in Authorization header`);
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      await this.documentService.softDelete(id, userId);

      return {
        status: 'SUCCESS',
        time_stamp: new Date(),
        message: 'Document deleted successfully',
      };
    } catch (error) {
      throw new HttpException(internalServerError(error.message || 'Internal Server Error'), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}