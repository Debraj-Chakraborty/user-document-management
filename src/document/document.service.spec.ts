import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from 'src/entity/index';
import { NotFoundException } from '@nestjs/common';

const mockDocument = {
  id: 1,
  title: 'Test Document',
  filePath: 'uploads/test.pdf',
  fileName: 'test.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  created_by: 1,
  created_on: new Date(),
  updated_on: null,
  updated_by: null,
  is_active: true,
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DocumentService', () => {
  let service: DocumentService;
  let repository: MockRepository<Document>;

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(mockDocument),
      save: jest.fn().mockResolvedValue(mockDocument),
      find: jest.fn().mockResolvedValue([mockDocument]),
      findOne: jest.fn().mockResolvedValue(mockDocument),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a document', async () => {
    const documentData = {
      title: 'Test Document',
      uploadedBy: 1,
      filePath: 'uploads/test.pdf',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    };

    const documentData1 = {
      title: 'Test Document',
      filePath: 'uploads/test.pdf',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    };
    
    const result = await service.create(documentData);
    expect(repository.create).toHaveBeenCalledWith({ ...documentData1, created_by: 1 });
    expect(repository.save).toHaveBeenCalledWith(mockDocument);
    expect(result).toEqual(mockDocument);
  });

  it('should retrieve all active documents', async () => {
    const result = await service.findAll();
    expect(repository.find).toHaveBeenCalledWith({
      select: ['id', 'title', 'filePath', 'fileName', 'mimeType', 'fileSize', 'created_on', 'is_active'],
      where: { is_active: true },
    });
    expect(result).toEqual([mockDocument]);
  });

  it('should retrieve a document by ID', async () => {
    const result = await service.findById(1);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockDocument);
  });

  it('should throw NotFoundException if document is not found', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a document', async () => {
    const updateData = { title: 'Updated Document' };
    const updatedDocument = { ...mockDocument, ...updateData };
    repository.save.mockResolvedValue(updatedDocument);

    const result = await service.update(1, updateData);
    expect(repository.save).toHaveBeenCalledWith(updatedDocument);
    expect(result).toEqual(updatedDocument);
  });

  it('should soft delete a document', async () => {
    const updatedDocument = { ...mockDocument, is_active: false, updated_by: 2, updated_on: new Date() };
    repository.save.mockResolvedValue(updatedDocument);

    await service.softDelete(1, 2);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ is_active: false, updated_by: 2 }));
  });
});
