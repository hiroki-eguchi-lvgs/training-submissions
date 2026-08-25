import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleDto } from './dto/article.dto';
import type { ArticlesQuery } from './schemas/articles-query.schema';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ArticlesQuery): Promise<ArticleDto[]> {
    return this.prisma.article.findMany({
      where: query.tag ? { tag: query.tag } : undefined,
      orderBy: { updated_at: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }
}