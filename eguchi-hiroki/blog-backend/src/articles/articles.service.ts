import { Injectable } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { ArticleDto } from './dto/article.dto';
import type { ArticlesQuery } from './schemas/articles-query.schema';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async findAll(query: ArticlesQuery): Promise<ArticleDto[]> {
    return this.articlesRepository.findAll(query);
  }
}
