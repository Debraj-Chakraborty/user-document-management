import { Role } from './roles.entity';
import { User } from './user.entity';
import { UserToken } from './usertoken.entity';
import { Document } from './document.entity';
import { IngestionProcess } from './ingestion.entity';

export const entities = [
  Role,
  User,
  UserToken,
  Document,
  IngestionProcess
];

export { Role, User, UserToken, Document, IngestionProcess };
