import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AuthService } from 'src/auth/auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Document } from 'src/entity/document.entity';

jest.mock('./document.service');
jest.mock('src/auth/auth.service');

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        AuthService,
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('create', () => {
    it('should successfully upload a document', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockBody = { title: 'Mock Document' };
      const mockResponse = {
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document uploaded successfully',
      };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'create').mockResolvedValue({} as Document);

      const result = await controller.create(mockBody, mockFile, mockRequest.headers.authorization);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when authorization header is missing', async () => {
      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };
    
      const mockBody = { title: 'Mock Document' };
    
      jest.spyOn(authService, 'validateToken').mockImplementation(() => {
        throw new HttpException('Authorization header is missing', HttpStatus.BAD_REQUEST);
      });
    
      await expect(controller.create(mockBody, mockFile, '')).rejects.toThrow(
        new HttpException('Authorization header is missing', HttpStatus.BAD_REQUEST)
      );
    });
    

    it('should throw error when authorization token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      };

      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockBody = { title: 'Mock Document' };

      jest.spyOn(authService, 'validateToken').mockImplementation(() => {
        throw new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED);
      });

      await expect(controller.create(mockBody, mockFile, mockRequest.headers.authorization)).rejects.toThrow(
        new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED)
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of documents successfully', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      const mockDocuments = [
        {
          id: 1,
          title: 'Document 1',
          filePath: 'uploads/document1.pdf',
          fileName: 'document1.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          created_on: new Date(),
          is_active: true,
          created_by: 1,         
          updated_by: 1,         
          updated_on: new Date(), 
        },
        {
          id: 2,
          title: 'Document 2',
          filePath: 'uploads/document2.pdf',
          fileName: 'document2.pdf',
          mimeType: 'application/pdf',
          fileSize: 2048,
          created_on: new Date(),
          is_active: true,
          created_by: 2,         
          updated_by: 2,         
          updated_on: new Date(), 
        }
      ];
      

      const mockResponse = {
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'Document list fetched successfully',
        data: mockDocuments,
      };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'findAll').mockResolvedValue(mockDocuments);

      const result = await controller.findAll(mockRequest.headers.authorization);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when authorization token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      };

      jest.spyOn(authService, 'validateToken').mockImplementation(() => {
        throw new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED);
      });

      await expect(controller.findAll(mockRequest.headers.authorization)).rejects.toThrow(
        new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED)
      );
    });
  });

  describe('update', () => {
    it('should successfully update a document', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockBody = { title: 'Updated Document' };
      const mockDocument = {
        id: 1,
        title: 'Updated Document',
        filePath: 'uploads/updatedfile.pdf',
        fileName: 'updatedfile.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        created_on: new Date(),
        is_active: true,
        created_by: 1,         
        updated_by: 1,         
        updated_on: new Date()  
      };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'update').mockResolvedValue(mockDocument);

      const result = await controller.update(1, mockRequest.headers.authorization, mockBody, mockFile);
      expect(result.status).toBe('SUCCESS');
      expect(documentService.update).toHaveBeenCalledWith(1, expect.anything());
    });

    it('should throw error when authorization token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      };

      jest.spyOn(authService, 'validateToken').mockImplementation(() => {
        throw new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED);
      });

      await expect(controller.update(1, mockRequest.headers.authorization, {}, {})).rejects.toThrow(
        new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw error when document is not found', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      const mockFile = {
        path: 'uploads/mockfile.pdf',
        originalname: 'mockfile.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockBody = { title: 'Updated Document' };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'update').mockRejectedValue(new Error('Document not found'));

      await expect(controller.update(1, mockRequest.headers.authorization, mockBody, mockFile)).rejects.toThrow(
        new HttpException('Document not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete a document', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'softDelete').mockResolvedValue();

      const result = await controller.delete(1, mockRequest.headers.authorization);
      expect(result.status).toBe('SUCCESS');
    });

    it('should throw error when authorization token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      };

      jest.spyOn(authService, 'validateToken').mockImplementation(() => {
        throw new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED);
      });

      await expect(controller.delete(1, mockRequest.headers.authorization)).rejects.toThrow(
        new HttpException('Invalid or malformed token.', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw error when document is not found', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
      };

      jest.spyOn(authService, 'validateToken').mockReturnValue({ sub: 1 });
      jest.spyOn(documentService, 'softDelete').mockRejectedValue(new Error('Document not found'));

      await expect(controller.delete(1, mockRequest.headers.authorization)).rejects.toThrow(
        new HttpException('Document not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});