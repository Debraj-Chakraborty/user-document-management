import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class IngestionProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  source: string;

  @Column({ default: 'in-progress' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
