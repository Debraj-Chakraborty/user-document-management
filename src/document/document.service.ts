import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from 'src/entity/index';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository<Document>,
  ) { }

  async create(data: {
    title: string;
    uploadedBy: number;
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }): Promise<Document> {
    const { title, uploadedBy, filePath, fileName, mimeType, fileSize } = data;

    const document = this.documentRepository.create({
      title,
      filePath,
      fileName,
      mimeType,
      fileSize,
      created_by: uploadedBy
    });

    return this.documentRepository.save(document);
  }

  async findAll() {
    try {
      return await this.documentRepository.find({
        select: ['id', 'title', 'filePath', 'fileName', 'mimeType', 'fileSize', 'created_on', 'is_active'],
        where: { is_active: true },
      });
    } catch (error) {
      throw new Error('Failed to retrieve documents');
    }
  }

  async findById(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: number, updateData: Partial<Document>): Promise<Document> {
    const document = await this.findById(id);

    Object.assign(document, updateData);
    return await this.documentRepository.save(document);
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const document = await this.findById(id);

    document.is_active = false;
    document.updated_by = userId;
    document.updated_on = new Date();

    await this.documentRepository.save(document);
  }
}