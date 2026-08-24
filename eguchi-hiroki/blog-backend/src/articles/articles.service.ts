import { Injectable } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async findAll(): Promise<ArticleDto[]> {
    return this.articlesRepository.findAll();
  }
}
