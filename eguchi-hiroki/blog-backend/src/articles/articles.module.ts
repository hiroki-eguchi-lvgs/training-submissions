import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [ConfigModule],
  controllers: [ArticlesController],
  providers: [ArticlesService]
})
export class ArticlesModule {}