import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedDatabaseModule } from './Helper/global-module/shared-database/shared-database.module';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    SharedDatabaseModule,
    AuthModule,
    DocumentModule,
    ScheduleModule.forRoot(),
    IngestionModule
  ],
  providers: [],
  exports: []
})
export class AppModule { }