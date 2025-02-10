import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user: number;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
