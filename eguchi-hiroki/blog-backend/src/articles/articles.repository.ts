import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ArticleDto[]> {
    return this.prisma.article.findMany({
      orderBy: { updated_at: 'desc' },
    });
  }
}
