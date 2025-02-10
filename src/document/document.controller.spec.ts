import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Document } from 'src/entity/document.entity';


jest.mock('./document.service');

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ sub: 1 }),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('create', () => {
    it('should successfully upload a document', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      } as unknown as Request;

      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockBody = { title: 'Mock Document' };
      jest.spyOn(documentService, 'create').mockResolvedValue(undefined);

      await expect(controller.create(mockBody, mockFile, mockRequest)).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document uploaded successfully',
      });
    });

    it('should throw an error if title is missing', async () => {
      const mockRequest = { headers: { authorization: 'Bearer mockToken' } } as unknown as Request;
      const mockFile = { path: 'uploads/mockfile.pdf', originalname: 'mockfile.pdf', mimetype: 'application/pdf', size: 1024 };

      await expect(controller.create({} as any, mockFile, mockRequest)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return a list of documents', async () => {
      const mockDocuments: Partial<Document>[] = [
        {
          id: 1,
          title: 'Test Document',
          filePath: 'uploads/test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          created_on: new Date(),
          updated_on: new Date(),
          updated_by: 1,
        },
      ];
      
      jest.spyOn(documentService, 'findAll').mockResolvedValue(mockDocuments as Document[]);
      await expect(controller.findAll()).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document list fetched successfully',
        data: mockDocuments,
      });
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const mockRequest = { headers: { authorization: 'Bearer mockToken' } } as unknown as Request;
      jest.spyOn(documentService, 'update').mockResolvedValue(undefined);

      await expect(controller.update(1, mockRequest, { title: 'Updated Title' })).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document updated successfully',
      });
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      const mockRequest = { headers: { authorization: 'Bearer mockToken' } } as unknown as Request;
      jest.spyOn(documentService, 'softDelete').mockResolvedValue(undefined);

      await expect(controller.delete(1, mockRequest)).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document deleted successfully',
      });
    });
  });
});